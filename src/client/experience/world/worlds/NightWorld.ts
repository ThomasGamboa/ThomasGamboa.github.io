import { Color, Group, Mesh, SphereGeometry, TorusKnotGeometry } from 'three';
import type { QualitySettings } from '../../core/quality.ts';
import type { FrameState } from '../../core/Ticker.ts';
import { createLiquidMaterial, type LiquidInks } from '../../materials/liquid.ts';
import type { CelestialBody, WorldLayout } from './layouts.ts';

const venom: LiquidInks = [
  new Color(0.012, 0, 0.003),
  new Color(0.2, 0.004, 0.018),
  new Color(0.62, 0.05, 0.07),
  new Color(0.07, 0, 0.016),
];

const lacquer = {
  color: new Color(1, 1, 1),
  metalness: 0.1,
  roughness: 0.2,
  clearcoat: 1,
  clearcoatRoughness: 0.03,
  iridescence: 0.4,
  iridescenceIOR: 1.7,
  iridescenceThicknessRange: [260, 520] as [number, number],
  sheen: 1,
  sheenColor: new Color(0.05, 0.42, 0.48),
  sheenRoughness: 0.32,
  envMapIntensity: 2.2,
  transparent: true,
};

interface Droplet {
  readonly mesh: Mesh;
  readonly phase: number;
  readonly speed: number;
  readonly distance: number;
  readonly lift: number;
}

export class NightWorld implements CelestialBody {
  readonly object = new Group();
  readonly chapterId: string;
  readonly #knotGeometry: TorusKnotGeometry;
  readonly #dropGeometry = new SphereGeometry(1, 72, 48);
  readonly #knot = createLiquidMaterial(
    { inks: venom, seed: 3.1, scale: 0.08, bump: 0.12, film: 0.1, warp: 0.5, warpScale: 0.1 },
    lacquer,
  );
  readonly #drop = createLiquidMaterial(
    { inks: venom, seed: 8.4, scale: 0.45, bump: 0.06, film: 0.1, warp: 0.07, warpScale: 0.8 },
    lacquer,
  );
  readonly #form: Mesh;
  readonly #droplets: Droplet[] = [];

  constructor(chapterId: string, layout: WorldLayout) {
    this.chapterId = chapterId;
    const { radius } = layout;
    this.object.name = `world-${chapterId}`;
    this.object.position.set(...layout.center);

    this.#knotGeometry = new TorusKnotGeometry(radius * 0.5, radius * 0.16, 420, 72, 2, 3);
    this.#form = new Mesh(this.#knotGeometry, this.#knot.material);
    this.#form.rotation.set(0.5, 0.2, 0.3);
    this.object.add(this.#form);

    [0.06, 0.09, 0.05, 0.12].forEach((size, index) => {
      const mesh = new Mesh(this.#dropGeometry, this.#drop.material);
      mesh.scale.setScalar(radius * size);
      this.object.add(mesh);
      this.#droplets.push({
        mesh,
        phase: index * 1.7,
        speed: 0.05 + index * 0.017,
        distance: radius * (1.05 + index * 0.16),
        lift: radius * (0.18 + (index % 2) * 0.22),
      });
    });
    this.object.visible = false;
  }

  setPresence(value: number): void {
    const eased = value * value * (3 - 2 * value);
    this.#knot.material.opacity = eased;
    this.#drop.material.opacity = eased;
    this.#knot.uniforms.uLiquidWarp.value = 0.5 + (1 - eased) * 1.6;
    this.object.scale.setScalar(0.55 + eased * 0.45);
    this.object.visible = value > 0.001;
  }

  applyQuality(quality: QualitySettings): void {
    const sheen = quality.tier === 'low' ? 0 : 1;
    this.#knot.material.sheen = sheen;
    this.#drop.material.sheen = sheen;
  }

  update({ elapsed }: FrameState): void {
    if (!this.object.visible) {
      return;
    }
    this.#knot.uniforms.uLiquidTime.value = elapsed;
    this.#drop.uniforms.uLiquidTime.value = elapsed;
    this.#form.rotation.y = 0.2 + elapsed * 0.035;
    this.#form.rotation.z = 0.3 + Math.sin(elapsed * 0.11) * 0.12;
    for (const droplet of this.#droplets) {
      const angle = droplet.phase + elapsed * droplet.speed;
      droplet.mesh.position.set(
        Math.cos(angle) * droplet.distance,
        Math.sin(angle * 0.7 + droplet.phase) * droplet.lift,
        Math.sin(angle) * droplet.distance,
      );
    }
  }

  dispose(): void {
    this.#knotGeometry.dispose();
    this.#dropGeometry.dispose();
    this.#knot.material.dispose();
    this.#drop.material.dispose();
  }
}
