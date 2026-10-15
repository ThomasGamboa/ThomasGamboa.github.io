import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Group,
  Mesh,
  type PerspectiveCamera,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';
import type { FrameState } from '../../core/Ticker.ts';
import { LensingEffect } from '../../effects/LensingEffect.ts';
import { createLiquidMaterial, type LiquidInks } from '../../materials/liquid.ts';
import noise from '../../shaders/noise.glsl?raw';
import vortexFragment from '../../shaders/vortex.frag.glsl?raw';
import vortexVertex from '../../shaders/vortex.vert.glsl?raw';
import type { WorldModule } from '../WorldModule.ts';
import type { Triple } from '../worlds/layouts.ts';

const projected = new Vector3();
const screenCenter = new Vector2();
const toCenter = new Vector3();
const viewDirection = new Vector3();

const ribbonOrbits: readonly [number, number, number][] = [
  [1.55, 0, 0.05],
  [2.05, 1.9, -0.08],
  [2.7, 4.1, 0.12],
  [3.5, 0.8, -0.04],
];

const mirror: LiquidInks = [
  new Color(0.05, 0.05, 0.055),
  new Color(0.09, 0.085, 0.09),
  new Color(0.2, 0.05, 0.06),
  new Color(0.03, 0.03, 0.035),
];

export class Singularity implements WorldModule {
  readonly object = new Group();
  readonly lensing = new LensingEffect();
  readonly center: Vector3;
  readonly radius: number;
  readonly #camera: PerspectiveCamera;
  readonly #orbGeometry: SphereGeometry;
  readonly #ringGeometry: TorusGeometry;
  readonly #orb = createLiquidMaterial(
    { inks: mirror, seed: 2.2, scale: 0.3, bump: 0.03, film: 0.3, warp: 0.05, warpScale: 0.5 },
    {
      color: new Color(1, 1, 1),
      metalness: 1,
      roughness: 0.05,
      iridescence: 1,
      iridescenceIOR: 1.8,
      iridescenceThicknessRange: [280, 900],
      envMapIntensity: 2.2,
    },
  );
  readonly #ribbon = createLiquidMaterial(
    { inks: mirror, seed: 6.1, scale: 1.4, bump: 0.02, film: 0.2, warp: 0.07, warpScale: 1.3 },
    {
      color: new Color(1, 1, 1),
      metalness: 0.9,
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      iridescence: 0.6,
      iridescenceIOR: 1.6,
      iridescenceThicknessRange: [260, 520],
      envMapIntensity: 2,
      transparent: true,
    },
  );
  readonly #disk: Mesh<RingGeometry, ShaderMaterial>;
  readonly #ribbons: Mesh[] = [];
  readonly #sphere: Mesh;
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
      uInner: { value: radius * 1.25 },
      uOuter: { value: radius * 5.4 },
      uTint: { value: new Color(1.15, 1.1, 1.08) },
    };

    this.#orbGeometry = new SphereGeometry(radius, 128, 96);
    this.#sphere = new Mesh(this.#orbGeometry, this.#orb.material);

    this.#ringGeometry = new TorusGeometry(1, 0.035, 24, 480);

    this.#disk = new Mesh(
      new RingGeometry(radius * 1.25, radius * 5.4, 256, 6),
      new ShaderMaterial({
        name: 'CausticVortex',
        vertexShader: vortexVertex,
        fragmentShader: `${noise}\n${vortexFragment}`,
        uniforms: this.#uniforms,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
      }),
    );

    const tilt = new Group();
    tilt.rotation.set(-Math.PI * 0.42, 0, 0.16);
    tilt.add(this.#disk);
    ribbonOrbits.forEach(([scale, roll, pitch]) => {
      const ribbon = new Mesh(this.#ringGeometry, this.#ribbon.material);
      ribbon.scale.set(radius * scale, radius * scale, radius * scale * 0.3);
      ribbon.rotation.set(pitch, 0, roll);
      tilt.add(ribbon);
      this.#ribbons.push(ribbon);
    });
    this.object.add(tilt, this.#sphere);
    this.object.visible = false;
  }

  setPresence(value: number): void {
    this.#presence = value;
    this.#uniforms.uPresence.value = value;
    this.#ribbon.material.opacity = value;
    this.#sphere.scale.setScalar(0.4 + value * 0.6);
    this.object.visible = value > 0.001;
  }

  update({ elapsed }: FrameState): void {
    this.#uniforms.uTime.value = elapsed;
    if (!this.object.visible) {
      this.lensing.configure(screenCenter.set(0.5, 0.5), 0.05, 0, this.#camera.aspect);
      return;
    }
    this.#orb.uniforms.uLiquidTime.value = elapsed;
    this.#ribbon.uniforms.uLiquidTime.value = elapsed;
    this.#ribbons.forEach((ribbon, index) => {
      ribbon.rotation.z = (ribbonOrbits[index]?.[1] ?? 0) - elapsed * (0.16 - index * 0.035);
    });
    this.#sphere.rotation.y = elapsed * 0.04;

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
    this.#orbGeometry.dispose();
    this.#ringGeometry.dispose();
    this.#orb.material.dispose();
    this.#ribbon.material.dispose();
    this.#disk.geometry.dispose();
    this.#disk.material.dispose();
    this.lensing.dispose();
  }
}
