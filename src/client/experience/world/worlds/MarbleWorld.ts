import { Color, Group, Mesh, type MeshPhysicalMaterial, SphereGeometry, Vector3 } from 'three';
import type { QualitySettings } from '../../core/quality.ts';
import { createRandom } from '../../core/random.ts';
import type { FrameState } from '../../core/Ticker.ts';
import {
  createLiquidMaterial,
  type LiquidInks,
  type LiquidUniforms,
} from '../../materials/liquid.ts';
import type { CelestialBody, WorldLayout } from './layouts.ts';

const palettes: readonly LiquidInks[] = [
  [
    new Color(0.015, 0.002, 0.004),
    new Color(0.42, 0.02, 0.04),
    new Color(1, 0.42, 0.42),
    new Color(0.9, 0.86, 0.82),
  ],
  [
    new Color(0.02, 0.005, 0.03),
    new Color(0.5, 0.03, 0.22),
    new Color(0.55, 0.62, 0.12),
    new Color(0.2, 0.05, 0.45),
  ],
  [
    new Color(0.01, 0.01, 0.012),
    new Color(0.12, 0.12, 0.13),
    new Color(0.82, 0.82, 0.85),
    new Color(0.45, 0.03, 0.05),
  ],
  [
    new Color(0.005, 0.012, 0.02),
    new Color(0.02, 0.18, 0.2),
    new Color(0.85, 0.82, 0.78),
    new Color(0.5, 0.04, 0.06),
  ],
  [
    new Color(0.012, 0.006, 0.004),
    new Color(0.3, 0.02, 0.02),
    new Color(0.92, 0.84, 0.7),
    new Color(0.03, 0.05, 0.25),
  ],
];

interface Marble {
  readonly core: Mesh;
  readonly shell: Mesh;
  readonly uniforms: LiquidUniforms;
  readonly material: MeshPhysicalMaterial;
  readonly home: Vector3;
  readonly size: number;
  readonly phase: number;
  readonly delay: number;
}

export class MarbleWorld implements CelestialBody {
  readonly object = new Group();
  readonly chapterId: string;
  readonly #sphere = new SphereGeometry(1, 96, 64);
  readonly #glass = createLiquidMaterial(
    { inks: palettes[0] ?? [0, 0, 0, 0], scale: 0.8, bump: 0.02, film: 0.3, marble: false },
    {
      color: new Color(1, 1, 1),
      metalness: 0,
      roughness: 0.02,
      transmission: 1,
      thickness: 0.7,
      ior: 1.42,
      dispersion: 0.5,
      iridescence: 0.7,
      iridescenceIOR: 1.33,
      iridescenceThicknessRange: [120, 760],
      envMapIntensity: 1.4,
    },
  );
  readonly #cluster = new Group();
  readonly #marbles: Marble[] = [];
  #presence = 0;

  constructor(chapterId: string, layout: WorldLayout, count: number, seed: number) {
    this.chapterId = chapterId;
    this.object.name = `world-${chapterId}`;
    this.object.position.set(...layout.center);
    const random = createRandom(seed);
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let index = 0; index < count; index += 1) {
      const t = (index + 0.5) / count;
      const elevation = 1 - 2 * t;
      const ring = Math.sqrt(1 - elevation * elevation);
      const angle = index * golden;
      const spread = layout.radius * (0.55 + random() * 0.35);
      const home = new Vector3(
        Math.cos(angle) * ring * spread,
        elevation * spread * 0.6,
        Math.sin(angle) * ring * spread * 0.8,
      );
      const { material, uniforms } = createLiquidMaterial(
        {
          inks: palettes[index % palettes.length] ?? palettes[0] ?? [0, 0, 0, 0],
          seed: index * 4.7 + random() * 3,
          scale: 0.55 + random() * 0.3,
          bump: 0.08,
          film: 0.12,
          warp: 0.05,
          warpScale: 1.5,
        },
        {
          color: new Color(1, 1, 1),
          metalness: 0,
          roughness: 0.32,
          clearcoat: 1,
          clearcoatRoughness: 0.03,
          iridescence: 0.35,
          iridescenceIOR: 1.5,
          iridescenceThicknessRange: [200, 600],
          envMapIntensity: 1.3,
        },
      );
      const core = new Mesh(this.#sphere, material);
      const shell = new Mesh(this.#sphere, this.#glass.material);
      this.#cluster.add(core, shell);
      this.#marbles.push({
        core,
        shell,
        uniforms,
        material,
        home,
        size: layout.radius * (0.15 + random() * 0.11),
        phase: random() * Math.PI * 2,
        delay: random() * 0.35,
      });
    }

    this.object.add(this.#cluster);
    this.object.visible = false;
  }

  setPresence(value: number): void {
    this.#presence = value;
    for (const marble of this.#marbles) {
      const grow = Math.min(Math.max((value - marble.delay) / (1 - marble.delay), 0), 1);
      const eased = grow * grow * (3 - 2 * grow);
      marble.core.scale.setScalar(Math.max(marble.size * eased, 0.0001));
      marble.shell.scale.setScalar(Math.max(marble.size * 1.24 * eased, 0.0001));
    }
    this.object.visible = value > 0.001;
  }

  applyQuality(quality: QualitySettings): void {
    const glass = this.#glass.material;
    glass.transmission = quality.transmission ? 1 : 0;
    glass.transparent = !quality.transmission;
    glass.opacity = quality.transmission ? 1 : 0.22;
    glass.depthWrite = quality.transmission;
    glass.needsUpdate = true;
    this.setPresence(this.#presence);
  }

  update({ elapsed }: FrameState): void {
    if (!this.object.visible) {
      return;
    }
    this.#glass.uniforms.uLiquidTime.value = elapsed;
    this.#cluster.rotation.y = elapsed * 0.02;
    for (const marble of this.#marbles) {
      marble.uniforms.uLiquidTime.value = elapsed;
      const sway = Math.sin(elapsed * 0.32 + marble.phase);
      marble.core.position.set(
        marble.home.x + Math.cos(elapsed * 0.21 + marble.phase) * 0.18,
        marble.home.y + sway * 0.3,
        marble.home.z,
      );
      marble.shell.position.copy(marble.core.position);
      marble.core.rotation.y = elapsed * 0.05 + marble.phase;
    }
  }

  dispose(): void {
    this.#sphere.dispose();
    this.#glass.material.dispose();
    for (const marble of this.#marbles) {
      marble.material.dispose();
    }
  }
}
