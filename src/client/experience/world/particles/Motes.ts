import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  type PerspectiveCamera,
  Points,
  Raycaster,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three';
import type { Pointer } from '../../core/Pointer.ts';
import type { QualitySettings } from '../../core/quality.ts';
import { createRandom } from '../../core/random.ts';
import type { FrameState } from '../../core/Ticker.ts';
import type { ViewportState } from '../../core/Viewport.ts';
import motesFragment from '../../shaders/motes.frag.glsl?raw';
import motesVertex from '../../shaders/motes.vert.glsl?raw';
import noise from '../../shaders/noise.glsl?raw';
import type { WorldModule } from '../WorldModule.ts';

const maximumCount = 2200;
const raycaster = new Raycaster();
const pointerNdc = new Vector2();

export class Motes implements WorldModule {
  readonly object: Points<BufferGeometry, ShaderMaterial>;
  readonly #camera: PerspectiveCamera;
  readonly #pointer: Pointer;
  readonly #uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uSize: { value: 26 },
    uEnergy: { value: 0 },
    uOpacity: { value: 0 },
    uCenter: { value: new Vector3() },
    uRayOrigin: { value: new Vector3() },
    uRayDirection: { value: new Vector3(0, 0, -1) },
    uRayActive: { value: 0 },
  };

  constructor(camera: PerspectiveCamera, pointer: Pointer, seed: number) {
    this.#camera = camera;
    this.#pointer = pointer;
    const random = createRandom(seed);
    const positions = new Float32Array(maximumCount * 3);
    const orbits = new Float32Array(maximumCount * 4);
    for (let index = 0; index < maximumCount; index += 1) {
      const spread = random() ** 0.7;
      orbits[index * 4] = 2.6 + spread * 9;
      orbits[index * 4 + 1] = random() * Math.PI * 2;
      orbits[index * 4 + 2] = (random() - 0.5) * (1.5 + spread * 7);
      orbits[index * 4 + 3] = random();
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aOrbit', new Float32BufferAttribute(orbits, 4));
    this.object = new Points(
      geometry,
      new ShaderMaterial({
        name: 'Motes',
        vertexShader: `${noise}\n${motesVertex}`,
        fragmentShader: motesFragment,
        uniforms: this.#uniforms,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    );
    this.object.name = 'motes';
    this.object.frustumCulled = false;
    this.object.visible = false;
  }

  setState(center: Vector3, opacity: number, energy: number): void {
    this.#uniforms.uCenter.value.copy(center);
    this.#uniforms.uOpacity.value = opacity;
    this.#uniforms.uEnergy.value = energy;
    this.object.visible = opacity > 0.001;
  }

  applyQuality(quality: QualitySettings): void {
    this.object.geometry.setDrawRange(0, Math.round(maximumCount * quality.particleScale));
  }

  resize({ pixelRatio }: ViewportState): void {
    this.#uniforms.uPixelRatio.value = pixelRatio;
  }

  update({ delta, elapsed }: FrameState): void {
    this.#uniforms.uTime.value = elapsed;
    const pointer = this.#pointer;
    raycaster.setFromCamera(pointerNdc.set(pointer.position.x, pointer.position.y), this.#camera);
    this.#uniforms.uRayOrigin.value.copy(raycaster.ray.origin);
    this.#uniforms.uRayDirection.value.copy(raycaster.ray.direction);
    const target = pointer.hovering ? 1 : 0;
    const active = this.#uniforms.uRayActive;
    active.value += (target - active.value) * (1 - Math.exp(-delta / 0.2));
  }

  dispose(): void {
    this.object.geometry.dispose();
    this.object.material.dispose();
  }
}
