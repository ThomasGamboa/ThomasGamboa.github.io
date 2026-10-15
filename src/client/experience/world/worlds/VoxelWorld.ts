import {
  BoxGeometry,
  Color,
  Group,
  InstancedMesh,
  Mesh,
  Object3D,
  SphereGeometry,
  Vector3,
} from 'three';
import { createRandom } from '../../core/random.ts';
import type { FrameState } from '../../core/Ticker.ts';
import { createLiquidMaterial, type LiquidInks } from '../../materials/liquid.ts';
import type { CelestialBody, WorldLayout } from './layouts.ts';

const gridRadius = 7;
const placement = new Object3D();
const fracture = new Vector3(-0.35, 0.3, 0.88).normalize();

const obsidian: LiquidInks = [
  new Color(0.012, 0.012, 0.014),
  new Color(0.06, 0.058, 0.064),
  new Color(0.2, 0.19, 0.21),
  new Color(0.22, 0.02, 0.03),
];

const opal: LiquidInks = [
  new Color(0.02, 0.004, 0.01),
  new Color(0.55, 0.04, 0.08),
  new Color(0.86, 0.8, 0.76),
  new Color(0.16, 0.06, 0.22),
];

interface Fragment {
  readonly home: Vector3;
  readonly lift: number;
  readonly phase: number;
  readonly spin: Vector3;
  readonly size: number;
}

export class VoxelWorld implements CelestialBody {
  readonly object = new Group();
  readonly chapterId: string;
  readonly #geometry = new BoxGeometry(0.92, 0.92, 0.92);
  readonly #eggGeometry = new SphereGeometry(1, 96, 64);
  readonly #stone = createLiquidMaterial(
    { inks: obsidian, seed: 1.7, scale: 0.22, film: 0.08 },
    {
      color: new Color(1, 1, 1),
      metalness: 0,
      roughness: 0.14,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      iridescence: 1,
      iridescenceIOR: 1.45,
      iridescenceThicknessRange: [260, 480],
      envMapIntensity: 2,
      transparent: true,
    },
  );
  readonly #yolk = createLiquidMaterial(
    { inks: opal, seed: 5.3, scale: 0.4, bump: 0.08, film: 0.15, warp: 0.06, warpScale: 0.7 },
    {
      color: new Color(1, 1, 1),
      metalness: 0.05,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      iridescence: 0.8,
      iridescenceIOR: 1.6,
      iridescenceThicknessRange: [240, 620],
      envMapIntensity: 1.6,
      transparent: true,
    },
  );
  readonly #shell: InstancedMesh;
  readonly #loose: InstancedMesh;
  readonly #egg: Mesh;
  readonly #fragments: Fragment[] = [];
  readonly #nest = new Group();
  readonly #unit: number;

  constructor(chapterId: string, layout: WorldLayout, seed: number) {
    this.chapterId = chapterId;
    this.object.name = `world-${chapterId}`;
    this.object.position.set(...layout.center);
    this.#unit = layout.radius / gridRadius;
    const random = createRandom(seed);

    const shellCells: Vector3[] = [];
    const cell = new Vector3();
    for (let x = -gridRadius; x <= gridRadius; x += 1) {
      for (let y = -gridRadius; y <= gridRadius; y += 1) {
        for (let z = -gridRadius; z <= gridRadius; z += 1) {
          const distance = Math.hypot(x, y, z);
          if (distance > gridRadius || distance <= gridRadius - 1) {
            continue;
          }
          cell.set(x, y, z);
          const alignment = cell.clone().normalize().dot(fracture);
          if (alignment > 0.74 + random() * 0.1) {
            this.#fragments.push({
              home: cell.clone().multiplyScalar(this.#unit),
              lift: (alignment - 0.6) * (0.5 + random() * 0.8),
              phase: random() * Math.PI * 2,
              spin: new Vector3(random() - 0.5, random() - 0.5, random() - 0.5),
              size: this.#unit * (0.55 + random() * 0.35),
            });
          } else {
            shellCells.push(cell.clone());
          }
        }
      }
    }

    this.#shell = new InstancedMesh(this.#geometry, this.#stone.material, shellCells.length);
    const tint = new Color();
    shellCells.forEach((point, index) => {
      placement.position.copy(point).multiplyScalar(this.#unit);
      placement.rotation.set(0, 0, 0);
      placement.scale.setScalar(this.#unit * (0.94 + random() * 0.06));
      placement.updateMatrix();
      this.#shell.setMatrixAt(index, placement.matrix);
      const shade = 0.75 + random() * 0.25;
      this.#shell.setColorAt(
        index,
        random() < 0.05 ? tint.setRGB(1, 0.32, 0.34) : tint.setRGB(shade, shade, shade),
      );
    });
    this.#shell.instanceMatrix.needsUpdate = true;

    this.#loose = new InstancedMesh(this.#geometry, this.#stone.material, this.#fragments.length);
    this.#fragments.forEach((_, index) => {
      this.#loose.setColorAt(index, tint.setRGB(0.9, 0.9, 0.9));
    });

    this.#egg = new Mesh(this.#eggGeometry, this.#yolk.material);
    this.#egg.scale.set(layout.radius * 0.38, layout.radius * 0.46, layout.radius * 0.38);

    this.#nest.add(this.#shell, this.#loose, this.#egg);
    this.object.add(this.#nest);
    this.object.visible = false;
  }

  setPresence(value: number): void {
    const eased = value * value * (3 - 2 * value);
    this.#stone.material.opacity = eased;
    this.#yolk.material.opacity = eased;
    this.object.scale.setScalar(0.7 + eased * 0.3);
    this.object.visible = value > 0.001;
  }

  update({ elapsed }: FrameState): void {
    if (!this.object.visible) {
      return;
    }
    this.#stone.uniforms.uLiquidTime.value = elapsed;
    this.#yolk.uniforms.uLiquidTime.value = elapsed;
    this.#nest.rotation.set(Math.sin(elapsed * 0.07) * 0.12, Math.sin(elapsed * 0.05) * 0.35, 0);
    this.#egg.rotation.y = elapsed * 0.08;

    this.#fragments.forEach((fragment, index) => {
      const breath = 1 + fragment.lift * (1.6 + 0.2 * Math.sin(elapsed * 0.4 + fragment.phase));
      placement.position.copy(fragment.home).multiplyScalar(breath);
      placement.rotation.set(
        fragment.spin.x * elapsed * 0.25,
        fragment.spin.y * elapsed * 0.25,
        fragment.spin.z * elapsed * 0.25,
      );
      placement.scale.setScalar(fragment.size * Math.max(1 - fragment.lift * 1.2, 0.35));
      placement.updateMatrix();
      this.#loose.setMatrixAt(index, placement.matrix);
    });
    this.#loose.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    this.#geometry.dispose();
    this.#eggGeometry.dispose();
    this.#stone.material.dispose();
    this.#yolk.material.dispose();
    this.#shell.dispose();
    this.#loose.dispose();
  }
}
