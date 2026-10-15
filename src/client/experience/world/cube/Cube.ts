import { Color, Group, Mesh, Quaternion, SphereGeometry, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { QualitySettings } from '../../core/quality.ts';
import type { FrameState } from '../../core/Ticker.ts';
import { createLiquidMaterial, type LiquidInks } from '../../materials/liquid.ts';
import type { WorldModule } from '../WorldModule.ts';

const size = 1.5;
const thickness = 0.08;
const restHeight = 2.3;

const venom: LiquidInks = [
  new Color(0.02, 0, 0.004),
  new Color(0.36, 0.01, 0.03),
  new Color(1, 0.36, 0.36),
  new Color(0.12, 0, 0.03),
];

interface Face {
  readonly pivot: Group;
  readonly normal: Vector3;
  readonly hinge: Vector3;
  readonly turn: number;
  readonly drift: number;
}

const faceNormals: readonly [number, number, number][] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

const forward = new Vector3(0, 0, 1);
const turn = new Quaternion();

export class Cube implements WorldModule {
  readonly object = new Group();
  readonly #shell = new Group();
  readonly #faces: Face[] = [];
  readonly #slab = new RoundedBoxGeometry(size, size, thickness, 6, thickness * 0.5);
  readonly #glass = createLiquidMaterial(
    { inks: venom, scale: 0.7, bump: 0.006, film: 0.12, marble: false },
    {
      color: new Color(1, 1, 1),
      metalness: 0,
      roughness: 0.03,
      transmission: 1,
      thickness: 0.9,
      ior: 1.42,
      dispersion: 0.6,
      iridescence: 0.55,
      iridescenceIOR: 1.33,
      iridescenceThicknessRange: [240, 420],
      envMapIntensity: 2.2,
      specularIntensity: 1,
    },
  );
  readonly #coreGeometry = new SphereGeometry(0.32, 96, 64);
  readonly #drop = createLiquidMaterial(
    { inks: venom, seed: 4.2, scale: 2.2, bump: 0.04, film: 0.12, warp: 0.018, warpScale: 1.8 },
    {
      color: new Color(1, 1, 1),
      metalness: 0.1,
      roughness: 0.14,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      iridescence: 0.7,
      iridescenceIOR: 1.7,
      iridescenceThicknessRange: [260, 520],
      sheen: 1,
      sheenColor: new Color(0.05, 0.42, 0.48),
      sheenRoughness: 0.32,
      envMapIntensity: 1.6,
    },
  );
  readonly #core: Mesh;
  #open = 0;
  #dissolve = 0;

  constructor() {
    this.object.name = 'cube';
    this.object.position.set(0, restHeight, 0);
    this.object.add(this.#shell);

    faceNormals.forEach(([x, y, z], index) => {
      const normal = new Vector3(x, y, z);
      const pivot = new Group();
      pivot.quaternion.copy(new Quaternion().setFromUnitVectors(forward, normal));
      pivot.position.copy(normal).multiplyScalar(size / 2 - thickness / 2);

      pivot.add(new Mesh(this.#slab, this.#glass.material));
      this.#shell.add(pivot);

      const hinge = new Vector3(z, x, y).cross(normal).normalize();
      this.#faces.push({
        pivot,
        normal,
        hinge: hinge.lengthSq() > 0 ? hinge : new Vector3(1, 0, 0),
        turn: 0.7 + (index % 3) * 0.35,
        drift: 1.4 + (index % 2) * 0.5,
      });
    });

    this.#core = new Mesh(this.#coreGeometry, this.#drop.material);
    this.object.add(this.#core);
  }

  get open(): number {
    return this.#open;
  }

  set open(value: number) {
    this.#open = Math.min(Math.max(value, 0), 1);
    const eased = this.#open * this.#open * (3 - 2 * this.#open);
    for (const face of this.#faces) {
      face.pivot.position
        .copy(face.normal)
        .multiplyScalar(size / 2 - thickness / 2 + eased * size * face.drift);
      face.pivot.quaternion
        .setFromUnitVectors(forward, face.normal)
        .premultiply(turn.setFromAxisAngle(face.hinge, eased * face.turn));
    }
  }

  set dissolve(value: number) {
    this.#dissolve = Math.min(Math.max(value, 0), 1);
    const fade = 1 - this.#dissolve;
    this.#shell.scale.setScalar(1 + this.#dissolve * 2.2);
    for (const face of this.#faces) {
      face.pivot.scale.setScalar(Math.max(fade, 0.001));
    }
    this.object.visible = this.#dissolve < 0.999;
  }

  applyQuality(quality: QualitySettings): void {
    const glass = this.#glass.material;
    glass.transmission = quality.transmission ? 1 : 0;
    glass.transparent = !quality.transmission;
    glass.opacity = quality.transmission ? 1 : 0.42;
    glass.depthWrite = quality.transmission;
    glass.needsUpdate = true;
    this.#drop.material.sheen = quality.tier === 'low' ? 0 : 1;
  }

  update({ elapsed }: FrameState): void {
    this.#glass.uniforms.uLiquidTime.value = elapsed;
    this.#drop.uniforms.uLiquidTime.value = elapsed;
    const settle = 1 - this.#open;
    this.object.position.y = restHeight + Math.sin(elapsed * 0.7) * 0.12 * settle;
    this.#shell.rotation.set(
      Math.sin(elapsed * 0.35) * 0.12 * settle,
      elapsed * 0.14 * settle + this.#open * 0.6,
      Math.cos(elapsed * 0.27) * 0.05 * settle,
    );
    const breath = 1 + Math.sin(elapsed * 0.9) * 0.04;
    this.#core.scale.setScalar(
      Math.max(breath * (1 + this.#open * 0.35) * (1 - this.#dissolve), 0.0001),
    );
    this.#core.rotation.set(elapsed * 0.11, elapsed * 0.17, 0);
  }

  dispose(): void {
    this.#slab.dispose();
    this.#glass.material.dispose();
    this.#coreGeometry.dispose();
    this.#drop.material.dispose();
  }
}
