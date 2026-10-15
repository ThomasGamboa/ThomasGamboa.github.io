import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  type PerspectiveCamera,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';
import { palette } from '../../../../shared/design/palette.ts';
import type { FrameState } from '../../core/Ticker.ts';
import { LensingEffect } from '../../effects/LensingEffect.ts';
import accretionFragment from '../../shaders/accretion.frag.glsl?raw';
import accretionVertex from '../../shaders/accretion.vert.glsl?raw';
import noise from '../../shaders/noise.glsl?raw';
import type { WorldModule } from '../WorldModule.ts';
import type { Triple } from '../worlds/layouts.ts';

const projected = new Vector3();
const screenCenter = new Vector2();
const toCenter = new Vector3();
const viewDirection = new Vector3();

export class Singularity implements WorldModule {
  readonly object = new Group();
  readonly lensing = new LensingEffect();
  readonly center: Vector3;
  readonly radius: number;
  readonly #camera: PerspectiveCamera;
  readonly #horizon: Mesh<SphereGeometry, MeshBasicMaterial>;
  readonly #photonRing: Mesh<TorusGeometry, MeshBasicMaterial>;
  readonly #disk: Mesh<RingGeometry, ShaderMaterial>;
  readonly #ringColor = new Color(3.2, 2.7, 2.3);
  readonly #uniforms;
  #presence = 0;

  constructor(camera: PerspectiveCamera, center: Triple, radius: number) {
    this.#camera = camera;
    this.center = new Vector3(...center);
    this.radius = radius;
    this.object.name = 'singularity';
    this.object.position.copy(this.center);

    this.#uniforms = {
      uTime: { value: 0 },
      uPresence: { value: 0 },
      uInner: { value: radius * 1.3 },
      uOuter: { value: radius * 5.4 },
      uHot: { value: new Color(3.4, 2.9, 2.4) },
      uWarm: { value: new Color(palette.signal).multiplyScalar(2.1) },
      uCool: { value: new Color(0.25, 0.04, 0.12) },
      uCenter: { value: this.center.clone() },
    };

    this.#horizon = new Mesh(
      new SphereGeometry(radius, 64, 32),
      new MeshBasicMaterial({ color: 0x000000 }),
    );
    this.#photonRing = new Mesh(
      new TorusGeometry(radius * 1.05, radius * 0.012, 12, 220),
      new MeshBasicMaterial({ color: this.#ringColor.clone() }),
    );
    this.#disk = new Mesh(
      new RingGeometry(radius * 1.3, radius * 5.4, 256, 6),
      new ShaderMaterial({
        name: 'AccretionDisk',
        vertexShader: accretionVertex,
        fragmentShader: `${noise}\n${accretionFragment}`,
        uniforms: this.#uniforms,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
      }),
    );
    this.#disk.rotation.set(-Math.PI * 0.44, 0, 0.18);

    this.object.add(this.#disk, this.#horizon, this.#photonRing);
    this.object.visible = false;
  }

  setPresence(value: number): void {
    this.#presence = value;
    this.#uniforms.uPresence.value = value;
    this.#photonRing.material.color.copy(this.#ringColor).multiplyScalar(value);
    this.object.visible = value > 0.001;
  }

  update({ elapsed }: FrameState): void {
    this.#uniforms.uTime.value = elapsed;
    if (!this.object.visible) {
      this.lensing.configure(screenCenter.set(0.5, 0.5), 0.05, 0, this.#camera.aspect);
      return;
    }
    this.#photonRing.quaternion.copy(this.#camera.quaternion);

    toCenter.subVectors(this.center, this.#camera.position);
    this.#camera.getWorldDirection(viewDirection);
    const inFront = toCenter.dot(viewDirection) > 0;
    projected.copy(this.center).project(this.#camera);
    screenCenter.set(projected.x * 0.5 + 0.5, projected.y * 0.5 + 0.5);
    const distance = toCenter.length();
    const halfFov = (this.#camera.fov * Math.PI) / 360;
    const screenRadius = this.radius / distance / Math.tan(halfFov) / 2;
    this.lensing.configure(
      screenCenter,
      screenRadius,
      inFront ? 0.9 * this.#presence : 0,
      this.#camera.aspect,
    );
  }

  dispose(): void {
    this.#horizon.geometry.dispose();
    this.#horizon.material.dispose();
    this.#photonRing.geometry.dispose();
    this.#photonRing.material.dispose();
    this.#disk.geometry.dispose();
    this.#disk.material.dispose();
    this.lensing.dispose();
  }
}
