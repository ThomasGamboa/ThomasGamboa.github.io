import {
  Color,
  Group,
  Mesh,
  type MeshPhysicalMaterial,
  type PerspectiveCamera,
  Raycaster,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three';
import type { Pointer } from '../../core/Pointer.ts';
import { createRandom } from '../../core/random.ts';
import type { FrameState } from '../../core/Ticker.ts';
import type { WorldModule } from '../WorldModule.ts';
import type { Entity } from './Entity.ts';
import {
  createEntityMaterial,
  createEntityUniforms,
  type EntityUniforms,
} from './entity-material.ts';
import type { FluidField } from './FluidField.ts';
import { moonPalettes } from './forms.ts';

interface Moon {
  readonly mesh: Mesh<SphereGeometry, MeshPhysicalMaterial>;
  readonly uniforms: EntityUniforms;
  readonly orbit: number;
  readonly speed: number;
  readonly phase: number;
  readonly tilt: number;
  readonly size: number;
  readonly push: Vector3;
  readonly pushVelocity: Vector3;
}

const raycaster = new Raycaster();
const pointerNdc = new Vector2();
const orbitPoint = new Vector3();
const closest = new Vector3();
const away = new Vector3();

export class Moons implements WorldModule {
  readonly object = new Group();
  readonly #entity: Entity;
  readonly #camera: PerspectiveCamera;
  readonly #pointer: Pointer;
  readonly #fluid: FluidField;
  readonly #geometry = new SphereGeometry(1, 64, 48);
  readonly #moons: Moon[] = [];
  #count = 0;

  constructor(
    entity: Entity,
    camera: PerspectiveCamera,
    pointer: Pointer,
    fluid: FluidField,
    capacity: number,
    seed: number,
  ) {
    this.#entity = entity;
    this.#camera = camera;
    this.#pointer = pointer;
    this.#fluid = fluid;
    this.object.name = 'moons';
    const random = createRandom(seed);
    for (let index = 0; index < capacity; index += 1) {
      const palette = moonPalettes[index % moonPalettes.length] ?? moonPalettes[0];
      if (!palette) {
        break;
      }
      const uniforms = createEntityUniforms(palette, [64, 48]);
      uniforms.uSeed.value = index * 7.3;
      uniforms.uWobble.value = 0.035;
      uniforms.uGlow.value = 0.12;
      uniforms.uRim.value = 0.45;
      uniforms.uBands.value = 1.2 + random() * 0.6;
      uniforms.uFluidOffset.value.set(random(), random() * 0.2);
      const material = createEntityMaterial(uniforms, {
        color: new Color(1, 1, 1),
        metalness: 0.6,
        roughness: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        iridescence: 0.75,
        iridescenceIOR: 1.6,
        iridescenceThicknessRange: [180, 560],
        envMapIntensity: 1.7,
      });
      const mesh = new Mesh(this.#geometry, material);
      mesh.frustumCulled = false;
      mesh.visible = false;
      this.object.add(mesh);
      this.#moons.push({
        mesh,
        uniforms,
        orbit: 1.75 + index * 0.42 + random() * 0.2,
        speed: (0.12 + random() * 0.12) * (index % 2 === 0 ? 1 : -0.8),
        phase: random() * Math.PI * 2,
        tilt: (random() - 0.5) * 0.9,
        size: 0.1 + random() * 0.08,
        push: new Vector3(),
        pushVelocity: new Vector3(),
      });
    }
  }

  set count(value: number) {
    this.#count = Math.min(Math.max(value, 0), this.#moons.length);
  }

  update({ delta, elapsed }: FrameState): void {
    const step = Math.min(delta, 1 / 30);
    const center = this.#entity.object.position;
    const scale = this.#entity.scale;
    const pointer = this.#pointer;
    raycaster.setFromCamera(pointerNdc.set(pointer.position.x, pointer.position.y), this.#camera);
    const ray = pointer.hovering ? raycaster.ray : null;

    this.#moons.forEach((moon, index) => {
      const emerge = Math.min(Math.max(this.#count - index, 0), 1);
      const eased = emerge * emerge * (3 - 2 * emerge);
      moon.mesh.visible = eased > 0.001;
      if (!moon.mesh.visible) {
        return;
      }
      const angle = moon.phase + elapsed * moon.speed;
      const radius = scale * moon.orbit * (0.45 + eased * 0.55);
      orbitPoint.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      orbitPoint.applyAxisAngle(away.set(1, 0, 0), moon.tilt);
      orbitPoint.add(center);

      if (ray) {
        ray.closestPointToPoint(orbitPoint, closest);
        away.subVectors(orbitPoint, closest);
        const distance = away.length();
        const reach = scale * 0.9;
        if (distance < reach) {
          moon.pushVelocity.addScaledVector(
            away.normalize(),
            (1 - distance / reach) * 14 * step * scale,
          );
        }
      }
      moon.pushVelocity.addScaledVector(moon.push, -18 * step);
      moon.pushVelocity.multiplyScalar(Math.exp(-step * 4));
      moon.push.addScaledVector(moon.pushVelocity, step);

      moon.mesh.position.copy(orbitPoint).add(moon.push);
      moon.mesh.scale.setScalar(Math.max(moon.size * scale * eased, 0.0001));
      moon.mesh.rotation.y = elapsed * 0.2 + moon.phase;
      moon.uniforms.uEntityTime.value = elapsed + index * 3.1;
      moon.uniforms.uFluid.value = this.#fluid.texture;
    });
  }

  dispose(): void {
    this.#geometry.dispose();
    for (const moon of this.#moons) {
      moon.mesh.material.dispose();
    }
  }
}
