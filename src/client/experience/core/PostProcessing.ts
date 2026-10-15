import {
  BlendFunction,
  BloomEffect,
  ChromaticAberrationEffect,
  type Effect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from 'postprocessing';
import { type Camera, HalfFloatType, type Scene, Vector2, type WebGLRenderer } from 'three';
import type { RenderProfile } from '../profile.ts';
import type { QualitySettings } from './quality.ts';
import type { ViewportState } from './Viewport.ts';

export class PostProcessing {
  readonly composer: EffectComposer;
  readonly bloom: BloomEffect;
  readonly chromaticAberration: ChromaticAberrationEffect;
  readonly grain: NoiseEffect;
  readonly vignette: VignetteEffect;
  readonly toneMapping: ToneMappingEffect;

  constructor(
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    quality: QualitySettings,
    profile: RenderProfile,
    overlays: readonly Effect[] = [],
  ) {
    this.composer = new EffectComposer(renderer, {
      frameBufferType: HalfFloatType,
      multisampling: quality.multisampling,
    });
    this.composer.addPass(new RenderPass(scene, camera));

    this.bloom = new BloomEffect({
      mipmapBlur: true,
      intensity: profile.bloom.intensity,
      luminanceThreshold: profile.bloom.threshold,
      luminanceSmoothing: profile.bloom.smoothing,
      radius: profile.bloom.radius,
      levels: quality.bloomLevels,
    });
    this.chromaticAberration = new ChromaticAberrationEffect({
      offset: new Vector2(profile.chromaticAberration.offset, profile.chromaticAberration.offset),
      radialModulation: true,
      modulationOffset: 0.2,
    });
    this.grain = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: false });
    this.grain.blendMode.opacity.value = profile.grain.opacity;
    this.vignette = new VignetteEffect({
      offset: profile.vignette.offset,
      darkness: profile.vignette.darkness,
    });
    this.toneMapping = new ToneMappingEffect({ mode: ToneMappingMode.AGX });

    this.composer.addPass(
      new EffectPass(
        camera,
        this.bloom,
        this.chromaticAberration,
        this.toneMapping,
        this.vignette,
        this.grain,
      ),
    );
    if (overlays.length > 0) {
      this.composer.addPass(new EffectPass(camera, ...overlays));
    }
  }

  applyProfile(profile: RenderProfile): void {
    this.bloom.intensity = profile.bloom.intensity;
    this.bloom.luminanceMaterial.threshold = profile.bloom.threshold;
    this.bloom.luminanceMaterial.smoothing = profile.bloom.smoothing;
    this.bloom.mipmapBlurPass.radius = profile.bloom.radius;
    this.chromaticAberration.offset.set(
      profile.chromaticAberration.offset,
      profile.chromaticAberration.offset,
    );
    this.grain.blendMode.opacity.value = profile.grain.opacity;
    this.vignette.offset = profile.vignette.offset;
    this.vignette.darkness = profile.vignette.darkness;
  }

  resize({ width, height }: ViewportState): void {
    this.composer.setSize(width, height, false);
  }

  render(delta: number): void {
    this.composer.render(delta);
  }

  dispose(): void {
    this.composer.dispose();
  }
}
