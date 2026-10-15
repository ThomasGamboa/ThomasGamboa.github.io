import { PerspectiveCamera, Scene, type WebGLRenderTarget } from 'three';
import { experienceAssets } from './assets.ts';
import { CameraRig } from './camera/CameraRig.ts';
import { heroShot, MutableShot, resolveShot } from './camera/shots.ts';
import { type AssetRegistry, loadAssets } from './core/AssetLoader.ts';
import { Pointer } from './core/Pointer.ts';
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
import { createEnvironmentMap } from './world/environment/environment-map.ts';
import { Sky } from './world/environment/Sky.ts';
import { Water } from './world/landscape/Water.ts';
import { Dust } from './world/particles/Dust.ts';
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
  readonly pointer = new Pointer();
  readonly rig: CameraRig;
  readonly #modules: WorldModule[];
  readonly #environment: WebGLRenderTarget;
  readonly #shot = new MutableShot();
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
    this.rig = new CameraRig(this.camera, this.pointer);
    this.rig.setShot(resolveShot(heroShot, this.viewport.state.aspect, this.#shot));

    const skyMap = assets.get('sky', 'environment') ?? null;
    this.#environment = createEnvironmentMap(this.renderer.instance, skyMap);
    this.scene.environment = this.#environment.texture;

    this.post = new PostProcessing(
      this.renderer.instance,
      this.scene,
      this.camera,
      this.#quality,
      this.profile,
    );
    this.post.resize(this.viewport.state);

    this.#modules = [
      new Sky(this.camera, skyMap),
      new Water(this.viewport.state),
      new Cube(),
      new Dust({ center: [0, 4, -6], extent: [48, 9, 46] }, 7),
    ];
    for (const module of this.#modules) {
      this.scene.add(module.object);
      module.applyQuality?.(this.#quality);
      module.resize?.(this.viewport.state);
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
    this.#environment.dispose();
    this.pointer.dispose();
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
    this.rig.setShot(resolveShot(heroShot, state.aspect, this.#shot));
    for (const module of this.#modules) {
      module.resize?.(state);
    }
  };

  readonly #onFrame = (frame: FrameState): void => {
    this.pointer.update(frame.delta);
    this.rig.update(frame);
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
