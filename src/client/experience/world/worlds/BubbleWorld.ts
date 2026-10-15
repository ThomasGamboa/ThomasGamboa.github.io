import {
  BufferGeometry,
  Color,
  EllipseCurve,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshPhysicalMaterial,
  SphereGeometry,
} from 'three';
import type { QualitySettings } from '../../core/quality.ts';
import { createRandom } from '../../core/random.ts';
import type { FrameState } from '../../core/Ticker.ts';
import { applySoapFilm, createSoapFilmUniforms } from '../../materials/soap-film.ts';
import type { CelestialBody, WorldLayout } from './layouts.ts';

interface Bubble {
  readonly mesh: Mesh;
  readonly pivot: Group;
  readonly speed: number;
  readonly phase: number;
  readonly distance: number;
}

export class BubbleWorld implements CelestialBody {
  readonly object = new Group();
  readonly chapterId: string;
  readonly #sphere = new SphereGeometry(1, 64, 40);
  readonly #film = createSoapFilmUniforms(1.3, 0.8);
  readonly #glass = new MeshPhysicalMaterial({
    color: new Color(1, 1, 1),
    metalness: 0,
    roughness: 0.02,
    transmission: 1,
    thickness: 0.05,
    ior: 1.1,
    iridescence: 1,
    iridescenceIOR: 1.33,
    iridescenceThicknessRange: [100, 820],
    envMapIntensity: 1.6,
    transparent: true,
  });
  readonly #orbitMaterial = new LineBasicMaterial({
    color: new Color(0.9, 0.88, 0.85),
    transparent: true,
    opacity: 0,
  });
  readonly #bubbles: Bubble[] = [];
  readonly #orbits: Line[] = [];
  #presence = 0;
  #transmission = true;

  constructor(chapterId: string, layout: WorldLayout, count: number, seed: number) {
    this.chapterId = chapterId;
    this.object.name = `world-${chapterId}`;
    this.object.position.set(...layout.center);
    applySoapFilm(this.#glass, this.#film);
    const random = createRandom(seed);

    for (let index = 0; index < count; index += 1) {
      const distance = layout.radius * (0.35 + (index / Math.max(count - 1, 1)) * 0.75);
      const pivot = new Group();
      pivot.rotation.set((random() - 0.5) * 0.8, random() * Math.PI, (random() - 0.5) * 0.5);
      const mesh = new Mesh(this.#sphere, this.#glass);
      mesh.scale.setScalar(layout.radius * (0.1 + random() * 0.11));
      pivot.add(mesh);

      const curve = new EllipseCurve(0, 0, distance, distance);
      const orbit = new Line(
        new BufferGeometry().setFromPoints(curve.getPoints(160)),
        this.#orbitMaterial,
      );
      orbit.rotation.x = Math.PI / 2;
      pivot.add(orbit);
      this.#orbits.push(orbit);

      this.object.add(pivot);
      this.#bubbles.push({
        mesh,
        pivot,
        distance,
        speed: (0.05 + random() * 0.08) * (random() > 0.5 ? 1 : -1),
        phase: random() * Math.PI * 2,
      });
    }
    this.object.visible = false;
  }

  setPresence(value: number): void {
    this.#presence = value;
    this.#glass.opacity = this.#transmission ? value : value * 0.45;
    this.#orbitMaterial.opacity = value * 0.14;
    this.object.scale.setScalar(0.75 + value * 0.25);
    this.object.visible = value > 0.001;
  }

  applyQuality(quality: QualitySettings): void {
    this.#transmission = quality.transmission;
    this.#glass.transmission = quality.transmission ? 1 : 0;
    this.#glass.depthWrite = quality.transmission;
    this.#glass.needsUpdate = true;
    this.setPresence(this.#presence);
  }

  update({ elapsed }: FrameState): void {
    if (!this.object.visible) {
      return;
    }
    this.#film.uFilmTime.value = elapsed;
    for (const bubble of this.#bubbles) {
      const angle = bubble.phase + elapsed * bubble.speed;
      bubble.mesh.position.set(
        Math.cos(angle) * bubble.distance,
        Math.sin(elapsed * 0.5 + bubble.phase) * 0.25,
        Math.sin(angle) * bubble.distance,
      );
    }
  }

  dispose(): void {
    this.#sphere.dispose();
    this.#glass.dispose();
    this.#orbitMaterial.dispose();
    for (const orbit of this.#orbits) {
      orbit.geometry.dispose();
    }
  }
}
