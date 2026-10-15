import {
  BoxGeometry,
  Color,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  Quaternion,
  Vector3,
} from 'three';
import { palette } from '../../../../shared/design/palette.ts';
import type { QualitySettings } from '../../core/quality.ts';
import type { FrameState } from '../../core/Ticker.ts';
import { applySoapFilm, createSoapFilmUniforms } from '../../materials/soap-film.ts';
import type { WorldModule } from '../WorldModule.ts';

const size = 1.5;
const thickness = 0.04;
const restHeight = 2.3;

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
  readonly #slab = new BoxGeometry(size, size, thickness);
  readonly #outline = new EdgesGeometry(new PlaneGeometry(size, size));
  readonly #glass = new MeshPhysicalMaterial({
    color: new Color(1, 1, 1),
    metalness: 0,
    roughness: 0.05,
    transmission: 1,
    thickness: 0.35,
    ior: 1.25,
    iridescence: 1,
    iridescenceIOR: 1.33,
    iridescenceThicknessRange: [160, 760],
    envMapIntensity: 1.5,
    specularIntensity: 1,
  });
  readonly #edgeMaterial = new LineBasicMaterial({
    color: new Color(palette.signal).multiplyScalar(2.2),
    transparent: true,
  });
  readonly #coreGeometry = new IcosahedronGeometry(0.2, 3);
  readonly #coreMaterial = new MeshBasicMaterial({ color: new Color(3.2, 1.1, 1.05) });
  readonly #latticeGeometry = new EdgesGeometry(new OctahedronGeometry(0.42));
  readonly #latticeMaterial = new LineBasicMaterial({
    color: new Color(1.4, 1.35, 1.3),
    transparent: true,
    opacity: 0.55,
  });
  readonly #film = createSoapFilmUniforms(1.2, 0.45);
  readonly #core: Mesh;
  readonly #lattice: LineSegments;
  #open = 0;

  constructor() {
    applySoapFilm(this.#glass, this.#film);
    this.object.name = 'cube';
    this.object.position.set(0, restHeight, 0);
    this.object.add(this.#shell);

    faceNormals.forEach(([x, y, z], index) => {
      const normal = new Vector3(x, y, z);
      const pivot = new Group();
      pivot.quaternion.copy(new Quaternion().setFromUnitVectors(forward, normal));
      pivot.position.copy(normal).multiplyScalar(size / 2 - thickness / 2);

      const slab = new Mesh(this.#slab, this.#glass);
      const outline = new LineSegments(this.#outline, this.#edgeMaterial);
      outline.position.z = thickness / 2 + 0.002;
      pivot.add(slab, outline);
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

    this.#core = new Mesh(this.#coreGeometry, this.#coreMaterial);
    this.#lattice = new LineSegments(this.#latticeGeometry, this.#latticeMaterial);
    this.object.add(this.#core, this.#lattice);
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
    this.#edgeMaterial.opacity = 1 - eased * 0.6;
  }

  applyQuality(quality: QualitySettings): void {
    this.#glass.transmission = quality.transmission ? 1 : 0;
    this.#glass.transparent = !quality.transmission;
    this.#glass.opacity = quality.transmission ? 1 : 0.42;
    this.#glass.depthWrite = quality.transmission;
    this.#glass.needsUpdate = true;
  }

  update({ elapsed }: FrameState): void {
    this.#film.uFilmTime.value = elapsed;
    const settle = 1 - this.#open;
    this.object.position.y = restHeight + Math.sin(elapsed * 0.7) * 0.12 * settle;
    this.#shell.rotation.set(
      Math.sin(elapsed * 0.35) * 0.12 * settle,
      elapsed * 0.14 * settle + this.#open * 0.6,
      Math.cos(elapsed * 0.27) * 0.05 * settle,
    );
    const pulse = 1 + Math.sin(elapsed * 2.1) * 0.06;
    this.#core.scale.setScalar(pulse * (1 + this.#open * 0.8));
    this.#lattice.rotation.set(elapsed * 0.3, elapsed * 0.45, 0);
    this.#lattice.scale.setScalar(1 + this.#open * 1.6);
  }

  dispose(): void {
    this.#slab.dispose();
    this.#outline.dispose();
    this.#glass.dispose();
    this.#edgeMaterial.dispose();
    this.#coreGeometry.dispose();
    this.#coreMaterial.dispose();
    this.#latticeGeometry.dispose();
    this.#latticeMaterial.dispose();
  }
}
