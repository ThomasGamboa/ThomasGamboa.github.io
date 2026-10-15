import { PerspectiveCamera, Scene, Vector2, type WebGLRenderTarget } from 'three';
import { cursorState } from '../ui/cursor-state.ts';
import { experienceAssets } from './assets.ts';
import { CameraRig } from './camera/CameraRig.ts';
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
import { measureStageCenter } from './core/stage.ts';
import { type FrameState, Ticker } from './core/Ticker.ts';
import { Viewport, type ViewportState } from './core/Viewport.ts';
import { CursorLensEffect } from './effects/CursorLensEffect.ts';
import { createRenderProfile, type RenderProfile } from './profile.ts';
import { Director } from './timeline/Director.ts';
import { ScrollTimeline } from './timeline/ScrollTimeline.ts';
import { composeWorld } from './world/compose.ts';
import { createEnvironmentMap } from './world/environment/environment-map.ts';
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
  readonly timeline: ScrollTimeline;
  readonly #director: Director;
  readonly #lens = new CursorLensEffect();
  readonly #lensCenter = new Vector2(0.5, 0.5);
  readonly #lensVelocity = new Vector2();
  #lensStrength = 0;
  readonly #modules: readonly WorldModule[];
  readonly #environment: WebGLRenderTarget;
  readonly #monitor = new FrameRateMonitor({
    targetFps: 45,
    windowSeconds: 2,
    warmupSeconds: 2,
    stableSeconds: 8,
  });
  readonly #ambientScale = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.15 : 1;
  #quality: QualitySettings;
  #adaptive: boolean;

  static async create(options: ExperienceOptions): Promise<Experience> {
    const stages = new WeightedProgress({ assets: 4, build: 1, compile: 3 }, options.onProgress);
    const assets = await loadAssets(experienceAssets, (progress) => stages.set('assets', progress));
    const experience = new Experience(options.canvas, assets, options.tierOverride);
    stages.set('build', 1);
    await experience.#compile();
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
    this.rig.parallaxStrength = this.#ambientScale < 1 ? 0 : 1;
    this.timeline = new ScrollTimeline(document);

    const skyMap = assets.get('sky', 'environment') ?? null;
    this.#environment = createEnvironmentMap(this.renderer.instance, skyMap);
    this.scene.environment = this.#environment.texture;

    const world = composeWorld({
      renderer: this.renderer.instance,
      camera: this.camera,
      pointer: this.pointer,
      viewport: this.viewport.state,
      skyMap,
      chapterIds: this.timeline.chapterIds,
      scope: document,
    });
    this.#modules = world.modules;
    this.#director = new Director(this.timeline, world.cast, world.forms, world.projectCount);
    for (const module of this.#modules) {
      this.scene.add(module.object);
      module.applyQuality?.(this.#quality);
      module.resize?.(this.viewport.state);
    }

    this.post = new PostProcessing(
      this.renderer.instance,
      this.scene,
      this.camera,
      this.#quality,
      this.profile,
      [this.#lens],
    );
    this.post.resize(this.viewport.state);

    this.#frameStage(this.viewport.state);
    this.timeline.update(0);
    this.rig.setShot(this.#director.frame(this.viewport.state.aspect));
    this.viewport.onChange(this.#onResize);
    this.ticker.add(this.#onFrame);
  }

  get quality(): QualitySettings {
    return this.#quality;
  }

  start(): void {
    this.#onFrame({ delta: 0, elapsed: 0, frame: 0 });
    this.ticker.start();
  }

  advance(seconds: number, step = 1 / 60): void {
    this.timeline.sync();
    let elapsed = 0;
    let frame = 0;
    while (elapsed < seconds) {
      elapsed += step;
      frame += 1;
      this.#onFrame({ delta: step, elapsed, frame });
    }
  }

  setTier(tier: QualityTier): void {
    this.#adaptive = false;
    this.#applyQuality(qualityPresets[tier]);
  }

  dispose(): void {
    this.ticker.stop();
    this.viewport.dispose();
    this.timeline.dispose();
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

  async #compile(): Promise<void> {
    const hidden = this.#modules.filter((module) => !module.object.visible);
    for (const module of hidden) {
      module.object.visible = true;
    }
    await this.renderer.instance.compileAsync(this.scene, this.camera);
    for (const module of hidden) {
      module.object.visible = false;
    }
  }

  #applyQuality(quality: QualitySettings): void {
    this.#quality = quality;
    this.post.composer.multisampling = quality.multisampling;
    this.viewport.setMaximumPixelRatio(quality.maxPixelRatio);
    for (const module of this.#modules) {
      module.applyQuality?.(quality);
    }
  }

  #updateLens(delta: number): void {
    const { width, height } = this.viewport.state;
    const target = cursorState.visible && !cursorState.overSurface ? 1 : 0;
    this.#lensStrength += (target - this.#lensStrength) * (1 - Math.exp(-delta / 0.18));
    this.#lensCenter.set(cursorState.x / width, 1 - cursorState.y / height);
    const speed = Math.hypot(cursorState.velocityX, cursorState.velocityY);
    const stretch = Math.min(speed / 2600, 0.45);
    this.#lensVelocity
      .set(cursorState.velocityX, -cursorState.velocityY)
      .normalize()
      .multiplyScalar(stretch);
    this.#lens.configure(
      this.#lensCenter,
      this.#lensVelocity,
      cursorState.radius / height,
      this.#lensStrength,
      this.viewport.state.aspect,
    );
  }

  #frameStage({ width, height }: ViewportState): void {
    const center = measureStageCenter(document, width, height);
    this.camera.setViewOffset(
      width,
      height,
      width / 2 - center.x,
      height / 2 - center.y,
      width,
      height,
    );
  }

  readonly #onResize = (state: ViewportState): void => {
    this.camera.aspect = state.aspect;
    this.#frameStage(state);
    this.camera.updateProjectionMatrix();
    this.renderer.resize(state);
    this.post.resize(state);
    for (const module of this.#modules) {
      module.resize?.(state);
    }
  };

  readonly #onFrame = (frame: FrameState): void => {
    this.pointer.update(frame.delta);
    this.timeline.update(frame.delta);
    this.rig.setShot(this.#director.frame(this.viewport.state.aspect));
    this.rig.update(frame);
    const ambient: FrameState = {
      delta: frame.delta * this.#ambientScale,
      elapsed: frame.elapsed * this.#ambientScale,
      frame: frame.frame,
    };
    for (const module of this.#modules) {
      module.update(ambient);
    }
    this.#updateLens(frame.delta);
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
