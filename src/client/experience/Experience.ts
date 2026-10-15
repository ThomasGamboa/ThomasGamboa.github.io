import { PerspectiveCamera, Scene } from 'three';
import { experienceAssets } from './assets.ts';
import { type AssetRegistry, loadAssets } from './core/AssetLoader.ts';
import { PostProcessing } from './core/PostProcessing.ts';
import type { ProgressListener } from './core/progress.ts';
import { WeightedProgress } from './core/progress.ts';
import {
  detectTier,
  FrameRateMonitor,
  lowerTier,
  type QualitySettings,
  type QualityTier,
  qualityPresets,
} from './core/quality.ts';
import { Renderer } from './core/Renderer.ts';
import { type FrameState, Ticker } from './core/Ticker.ts';
import { Viewport, type ViewportState } from './core/Viewport.ts';
import { createRenderProfile, type RenderProfile } from './profile.ts';
import { Cube } from './world/cube/Cube.ts';
import type { WorldModule } from './world/WorldModule.ts';

export interface ExperienceOptions {
  readonly canvas: HTMLCanvasElement;
  readonly onProgress: ProgressListener;
  readonly tierOverride: QualityTier | null;
}

export class Experience {
  readonly scene = new Scene();
  readonly camera: PerspectiveCamera;
  readonly renderer: Renderer;
  readonly viewport: Viewport;
  readonly ticker = new Ticker();
  readonly profile: RenderProfile = createRenderProfile();
  readonly post: PostProcessing;
  readonly assets: AssetRegistry;
  readonly #modules: WorldModule[];
  readonly #monitor = new FrameRateMonitor({
    targetFps: 45,
    windowSeconds: 2,
    warmupSeconds: 2,
    stableSeconds: 8,
  });
  #quality: QualitySettings;
  #adaptive: boolean;

  static async create(options: ExperienceOptions): Promise<Experience> {
    const stages = new WeightedProgress({ assets: 4, build: 1, compile: 3 }, options.onProgress);
    const assets = await loadAssets(experienceAssets, (progress) => stages.set('assets', progress));
    const experience = new Experience(options.canvas, assets, options.tierOverride);
    stages.set('build', 1);
    await experience.renderer.instance.compileAsync(experience.scene, experience.camera);
    stages.set('compile', 1);
    return experience;
  }

  private constructor(
    canvas: HTMLCanvasElement,
    assets: AssetRegistry,
    tierOverride: QualityTier | null,
  ) {
    this.assets = assets;
    this.renderer = new Renderer(canvas);
    this.#quality = qualityPresets[tierOverride ?? detectTier(this.renderer.readDeviceSignals())];
    this.#adaptive = tierOverride === null;
    this.viewport = new Viewport(canvas, this.#quality.maxPixelRatio);
    this.renderer.resize(this.viewport.state);

    this.camera = new PerspectiveCamera(40, this.viewport.state.aspect, 0.1, 2000);
    this.camera.position.set(0, 0, 4.5);

    this.post = new PostProcessing(
      this.renderer.instance,
      this.scene,
      this.camera,
      this.#quality,
      this.profile,
    );
    this.post.resize(this.viewport.state);

    this.#modules = [new Cube()];
    for (const module of this.#modules) {
      this.scene.add(module.object);
      module.applyQuality?.(this.#quality);
    }

    this.viewport.onChange(this.#onResize);
    this.ticker.add(this.#onFrame);
  }

  get quality(): QualitySettings {
    return this.#quality;
  }

  start(): void {
    this.post.render(0);
    this.ticker.start();
  }

  setTier(tier: QualityTier): void {
    this.#adaptive = false;
    this.#applyQuality(qualityPresets[tier]);
  }

  dispose(): void {
    this.ticker.stop();
    this.viewport.dispose();
    for (const module of this.#modules) {
      this.scene.remove(module.object);
      module.dispose();
    }
    this.post.dispose();
    this.assets.dispose();
    this.renderer.dispose();
  }

  #applyQuality(quality: QualitySettings): void {
    this.#quality = quality;
    this.post.composer.multisampling = quality.multisampling;
    this.viewport.setMaximumPixelRatio(quality.maxPixelRatio);
    for (const module of this.#modules) {
      module.applyQuality?.(quality);
    }
  }

  readonly #onResize = (state: ViewportState): void => {
    this.camera.aspect = state.aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.resize(state);
    this.post.resize(state);
  };

  readonly #onFrame = (frame: FrameState): void => {
    for (const module of this.#modules) {
      module.update(frame);
    }
    this.post.render(frame.delta);

    if (this.#adaptive) {
      const verdict = this.#monitor.sample(frame.delta);
      const lower = verdict === 'degrade' ? lowerTier(this.#quality.tier) : null;
      if (lower) {
        this.#applyQuality(qualityPresets[lower]);
        this.#monitor.reset();
      } else if (verdict === 'stable' || verdict === 'degrade') {
        this.#adaptive = false;
      }
    }
  };
}
