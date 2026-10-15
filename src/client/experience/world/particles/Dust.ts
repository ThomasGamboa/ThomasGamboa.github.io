import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Points,
  ShaderMaterial,
} from 'three';
import type { QualitySettings } from '../../core/quality.ts';
import { createRandom } from '../../core/random.ts';
import type { FrameState } from '../../core/Ticker.ts';
import type { ViewportState } from '../../core/Viewport.ts';
import dustFragment from '../../shaders/dust.frag.glsl?raw';
import dustVertex from '../../shaders/dust.vert.glsl?raw';
import type { WorldModule } from '../WorldModule.ts';

const maximumCount = 2400;

export interface DustVolume {
  readonly center: readonly [number, number, number];
  readonly extent: readonly [number, number, number];
}

export class Dust implements WorldModule {
  readonly object: Points<BufferGeometry, ShaderMaterial>;
  readonly #uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uSize: { value: 64 },
    uOpacity: { value: 1 },
    uColor: { value: new Color(1.2, 1.15, 1.1) },
    uAccent: { value: new Color(0.6, 1.4, 1.8) },
  };

  constructor(volume: DustVolume, seed: number) {
    const random = createRandom(seed);
    const positions = new Float32Array(maximumCount * 3);
    const seeds = new Float32Array(maximumCount);
    for (let index = 0; index < maximumCount; index += 1) {
      positions[index * 3] = volume.center[0] + (random() - 0.5) * volume.extent[0];
      positions[index * 3 + 1] = volume.center[1] + (random() - 0.5) * volume.extent[1];
      positions[index * 3 + 2] = volume.center[2] + (random() - 0.5) * volume.extent[2];
      seeds[index] = random();
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1));

    this.object = new Points(
      geometry,
      new ShaderMaterial({
        name: 'Dust',
        vertexShader: dustVertex,
        fragmentShader: dustFragment,
        uniforms: this.#uniforms,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    );
    this.object.name = 'dust';
    this.object.frustumCulled = false;
  }

  set opacity(value: number) {
    this.#uniforms.uOpacity.value = value;
    this.object.visible = value > 0.001;
  }

  applyQuality(quality: QualitySettings): void {
    this.object.geometry.setDrawRange(0, Math.round(maximumCount * quality.particleScale));
  }

  resize({ pixelRatio }: ViewportState): void {
    this.#uniforms.uPixelRatio.value = pixelRatio;
  }

  update({ elapsed }: FrameState): void {
    this.#uniforms.uTime.value = elapsed;
  }

  dispose(): void {
    this.object.geometry.dispose();
    this.object.material.dispose();
  }
}
