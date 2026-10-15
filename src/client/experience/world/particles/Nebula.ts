import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three';
import { palette } from '../../../../shared/design/palette.ts';
import type { QualitySettings } from '../../core/quality.ts';
import { createRandom } from '../../core/random.ts';
import type { FrameState } from '../../core/Ticker.ts';
import type { ViewportState } from '../../core/Viewport.ts';
import nebulaFragment from '../../shaders/nebula.frag.glsl?raw';
import nebulaVertex from '../../shaders/nebula.vert.glsl?raw';
import noise from '../../shaders/noise.glsl?raw';
import type { WorldModule } from '../WorldModule.ts';

const maximumCount = 42000;

export interface NebulaPath {
  readonly start: number;
  readonly end: number;
  readonly height: number;
}

const tones = [
  new Color(0.78, 0.75, 0.72),
  new Color(0.32, 0.31, 0.33),
  new Color(0.42, 0.03, 0.05),
  new Color(palette.signal).multiplyScalar(0.75),
  new Color(0.95, 0.93, 0.9),
];
const toneWeights = [0.3, 0.32, 0.2, 0.08, 0.1];

export class Nebula implements WorldModule {
  readonly object: Points<BufferGeometry, ShaderMaterial>;
  readonly #uniforms = {
    uTime: { value: 0 },
    uBirth: { value: 0 },
    uPixelRatio: { value: 1 },
    uSize: { value: 110 },
    uOpacity: { value: 0 },
    uOrigin: { value: new Vector3() },
  };

  constructor(origin: Vector3, path: NebulaPath, seed: number) {
    this.#uniforms.uOrigin.value.copy(origin);
    const random = createRandom(seed);
    const positions = new Float32Array(maximumCount * 3);
    const orbits = new Float32Array(maximumCount * 3);
    const colors = new Float32Array(maximumCount * 4);

    for (let index = 0; index < maximumCount; index += 1) {
      const along = random();
      const z = path.start + (path.end - path.start) * along;
      const twist = along * Math.PI * 5;
      const arm = Math.floor(random() * 3) * ((Math.PI * 2) / 3);
      const spread = random() ** 0.55;
      const radius = 6 + spread * 70;
      const angle = twist + arm + (random() - 0.5) * (0.6 + spread * 1.4);

      positions[index * 3] = 0;
      positions[index * 3 + 1] = path.height + (random() - 0.5) * 6 * (1 + spread * 2);
      positions[index * 3 + 2] = z;
      orbits[index * 3] = radius;
      orbits[index * 3 + 1] = angle;
      orbits[index * 3 + 2] = random() > 0.5 ? 1 : -0.6;

      let pick = random();
      let toneIndex = 0;
      while (toneIndex < toneWeights.length - 1 && pick > (toneWeights[toneIndex] ?? 1)) {
        pick -= toneWeights[toneIndex] ?? 0;
        toneIndex += 1;
      }
      const tone = tones[toneIndex] ?? tones[0];
      const brightness = 0.35 + random() * 0.9;
      colors[index * 4] = (tone?.r ?? 1) * brightness;
      colors[index * 4 + 1] = (tone?.g ?? 1) * brightness;
      colors[index * 4 + 2] = (tone?.b ?? 1) * brightness;
      colors[index * 4 + 3] = random();
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aOrbit', new Float32BufferAttribute(orbits, 3));
    geometry.setAttribute('aTone', new Float32BufferAttribute(colors, 4));

    this.object = new Points(
      geometry,
      new ShaderMaterial({
        name: 'Nebula',
        vertexShader: `${noise}\n${nebulaVertex}`,
        fragmentShader: nebulaFragment,
        uniforms: this.#uniforms,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    );
    this.object.name = 'nebula';
    this.object.frustumCulled = false;
    this.object.visible = false;
  }

  setPresence(birth: number, opacity: number): void {
    this.#uniforms.uBirth.value = birth;
    this.#uniforms.uOpacity.value = opacity;
    this.object.visible = opacity > 0.001;
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
