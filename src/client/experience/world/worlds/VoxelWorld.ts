import {
  BoxGeometry,
  Color,
  Group,
  InstancedMesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
} from 'three';
import { palette } from '../../../../shared/design/palette.ts';
import { createRandom } from '../../core/random.ts';
import type { FrameState } from '../../core/Ticker.ts';
import type { CelestialBody, WorldLayout } from './layouts.ts';

const gridRadius = 10;
const debrisCount = 60;
const placement = new Object3D();

interface Debris {
  readonly radius: number;
  readonly phase: number;
  readonly speed: number;
  readonly tilt: number;
  readonly spin: number;
}

export class VoxelWorld implements CelestialBody {
  readonly object = new Group();
  readonly chapterId: string;
  readonly #geometry = new BoxGeometry(0.92, 0.92, 0.92);
  readonly #material = new MeshStandardMaterial({
    color: new Color(1, 1, 1),
    metalness: 0.78,
    roughness: 0.32,
    envMapIntensity: 1.4,
    transparent: true,
  });
  readonly #glowMaterial = new MeshBasicMaterial({
    color: new Color(palette.signal).multiplyScalar(2.6),
    transparent: true,
  });
  readonly #shell: InstancedMesh;
  readonly #glow: InstancedMesh;
  readonly #debris: InstancedMesh;
  readonly #debrisOrbits: Debris[] = [];
  readonly #core = new Group();
  readonly #unit: number;

  constructor(chapterId: string, layout: WorldLayout, seed: number) {
    this.chapterId = chapterId;
    this.object.name = `world-${chapterId}`;
    this.object.position.set(...layout.center);
    this.#unit = layout.radius / gridRadius;
    const random = createRandom(seed);

    const shellCells: [number, number, number][] = [];
    const glowCells: [number, number, number][] = [];
    for (let x = -gridRadius; x <= gridRadius; x += 1) {
      for (let y = -gridRadius; y <= gridRadius; y += 1) {
        for (let z = -gridRadius; z <= gridRadius; z += 1) {
          const distance = Math.hypot(x, y, z);
          if (distance > gridRadius || distance <= gridRadius - 1) {
            continue;
          }
          if (random() < 0.025) {
            glowCells.push([x, y, z]);
          } else {
            shellCells.push([x, y, z]);
          }
        }
      }
    }

    this.#shell = this.#createInstances(this.#material, shellCells, random, true);
    this.#glow = this.#createInstances(this.#glowMaterial, glowCells, random, false);
    this.#debris = new InstancedMesh(this.#geometry, this.#material, debrisCount);
    for (let index = 0; index < debrisCount; index += 1) {
      this.#debrisOrbits.push({
        radius: layout.radius * (1.25 + random() * 0.4),
        phase: random() * Math.PI * 2,
        speed: 0.08 + random() * 0.12,
        tilt: (random() - 0.5) * 0.9,
        spin: random() * 3,
      });
    }

    this.#core.add(this.#shell, this.#glow);
    this.object.add(this.#core, this.#debris);
    this.object.visible = false;
  }

  setPresence(value: number): void {
    this.#material.opacity = value;
    this.#glowMaterial.opacity = value;
    this.object.scale.setScalar(0.7 + value * 0.3);
    this.object.visible = value > 0.001;
  }

  update({ elapsed }: FrameState): void {
    if (!this.object.visible) {
      return;
    }
    this.#core.rotation.set(elapsed * 0.03, elapsed * 0.06, 0);
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 1.7);
    this.#glowMaterial.color.setRGB(1.3 + pulse * 0.7, 0.28 + pulse * 0.14, 0.28 + pulse * 0.14);

    this.#debrisOrbits.forEach((orbit, index) => {
      const angle = orbit.phase + elapsed * orbit.speed;
      placement.position.set(
        Math.cos(angle) * orbit.radius,
        Math.sin(angle * 1.3) * orbit.radius * orbit.tilt,
        Math.sin(angle) * orbit.radius,
      );
      placement.rotation.set(elapsed * 0.4 + orbit.spin, elapsed * 0.3, 0);
      placement.scale.setScalar(this.#unit * (0.35 + (index % 3) * 0.18));
      placement.updateMatrix();
      this.#debris.setMatrixAt(index, placement.matrix);
    });
    this.#debris.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    this.#geometry.dispose();
    this.#material.dispose();
    this.#glowMaterial.dispose();
    this.#shell.dispose();
    this.#glow.dispose();
    this.#debris.dispose();
  }

  #createInstances(
    material: MeshStandardMaterial | MeshBasicMaterial,
    cells: readonly [number, number, number][],
    random: () => number,
    tinted: boolean,
  ): InstancedMesh {
    const mesh = new InstancedMesh(this.#geometry, material, cells.length);
    const tint = new Color();
    cells.forEach(([x, y, z], index) => {
      placement.position.set(x * this.#unit, y * this.#unit, z * this.#unit);
      placement.rotation.set(0, 0, 0);
      placement.scale.setScalar(this.#unit * (0.82 + random() * 0.18));
      placement.updateMatrix();
      mesh.setMatrixAt(index, placement.matrix);
      if (tinted) {
        const shade = 0.05 + random() * 0.09;
        mesh.setColorAt(
          index,
          random() < 0.08 ? tint.setRGB(0.42, 0.05, 0.06) : tint.setRGB(shade, shade, shade * 1.1),
        );
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }
}
