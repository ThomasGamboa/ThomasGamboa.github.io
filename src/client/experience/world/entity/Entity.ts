import {
  Color,
  Group,
  Mesh,
  type MeshPhysicalMaterial,
  type PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Sphere,
  Vector2,
  Vector3,
} from 'three';
import type { Triple } from '../../camera/shots.ts';
import type { Pointer } from '../../core/Pointer.ts';
import type { QualitySettings } from '../../core/quality.ts';
import type { FrameState } from '../../core/Ticker.ts';
import type { IntroState } from '../../timeline/Intro.ts';
import type { FilmReflections } from '../environment/Reflections.ts';
import type { WorldModule } from '../WorldModule.ts';
import {
  createEntityMaterial,
  createEntityUniforms,
  type EntityUniforms,
  type Palette,
  writePalette,
} from './entity-material.ts';
import type { FluidField } from './FluidField.ts';
import { type EntityForm, shapeIndex } from './forms.ts';

const segmentsByTier = {
  low: [160, 80],
  medium: [224, 112],
  high: [320, 160],
} as const;

const raycaster = new Raycaster();
const pointerNdc = new Vector2();
const bounds = new Sphere();
const hit = new Vector3();
const local = new Vector3();
const inverse = new Quaternion();
const right = new Vector3();
const up = new Vector3();
const jellyTarget = new Vector3();
const restingDispersion = 0.35;

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function surfaceUv(direction: Vector3): [number, number] {
  const theta = Math.atan2(direction.z, -direction.x);
  const u = (theta / (Math.PI * 2) + 1) % 1;
  const v = 1 - Math.acos(Math.min(Math.max(direction.y, -1), 1)) / Math.PI;
  return [u, v];
}

export class Entity implements WorldModule {
  readonly object = new Group();
  readonly center: Vector3;
  readonly uniforms: EntityUniforms;
  readonly #pivot = new Group();
  readonly #camera: PerspectiveCamera;
  readonly #pointer: Pointer;
  readonly #fluid: FluidField;
  readonly #intro: IntroState;
  readonly #material: MeshPhysicalMaterial;
  readonly #mesh: Mesh<PlaneGeometry, MeshPhysicalMaterial>;
  readonly #jelly = new Vector3();
  readonly #jellyVelocity = new Vector3();
  readonly #angular = { x: 0, y: 0 };
  #segments: readonly [number, number] = segmentsByTier.high;
  #paletteFrom: Palette | null = null;
  #paletteTo: Palette | null = null;
  #transmission = true;
  #scale = 1;
  #spin = 0.1;
  #spinAngle = 0;
  #tilt = 0;
  #glass = 0;
  #roughness = 0.3;
  #dent = 0;
  #rippleAge = 10;
  #rippleGain = 1;
  #energy = 0;
  #hovered = false;

  constructor(
    camera: PerspectiveCamera,
    pointer: Pointer,
    fluid: FluidField,
    center: Triple,
    palette: Palette,
    film: FilmReflections,
    intro: IntroState,
  ) {
    this.#camera = camera;
    this.#pointer = pointer;
    this.#fluid = fluid;
    this.#intro = intro;
    this.center = new Vector3(...center);
    this.uniforms = createEntityUniforms(palette, this.#segments, film);
    this.#material = createEntityMaterial(this.uniforms, {
      color: new Color(1, 1, 1),
      metalness: 0,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      ior: 1.45,
      thickness: 1.4,
      dispersion: restingDispersion,
      transmission: 1,
      iridescence: 0.0001,
      iridescenceIOR: 1.6,
      iridescenceThicknessRange: [180, 560],
      envMapIntensity: 1.25,
    });
    this.#mesh = new Mesh(new PlaneGeometry(1, 1, ...this.#segments), this.#material);
    this.#mesh.frustumCulled = false;
    this.#pivot.add(this.#mesh);
    this.object.add(this.#pivot);
    this.object.name = 'entity';
    this.object.position.copy(this.center);
  }

  get scale(): number {
    return this.#scale;
  }

  get glass(): number {
    return this.#glass;
  }

  get energy(): number {
    return this.#energy;
  }

  setMorph(from: EntityForm, to: EntityForm, amount: number): void {
    const t = Math.min(Math.max(amount, 0), 1);
    const uniforms = this.uniforms;
    uniforms.uShapeA.value = shapeIndex(from.shape);
    uniforms.uShapeB.value = shapeIndex(to.shape);
    uniforms.uMorph.value = t;
    if (from.palette !== this.#paletteFrom) {
      writePalette(uniforms.uPaletteA.value, from.palette);
      this.#paletteFrom = from.palette;
    }
    if (to.palette !== this.#paletteTo) {
      writePalette(uniforms.uPaletteB.value, to.palette);
      this.#paletteTo = to.palette;
    }
    uniforms.uPaletteMix.value = t;
    this.#energy = from === to ? 0 : Math.sin(Math.PI * t);
    uniforms.uWobble.value = mix(from.wobble, to.wobble, t);
    uniforms.uTurbulence.value = from.shape === to.shape ? 0.08 : 0.2;
    uniforms.uGlow.value = mix(from.glow, to.glow, t) + this.#energy * 0.35;
    const charge = this.#intro.charge;
    uniforms.uRim.value = mix(from.rim, to.rim, t) + charge * 1.1;
    uniforms.uBands.value = mix(from.bands, to.bands, t);
    uniforms.uFilm.value = mix(mix(from.film, to.film, t), 1, charge);
    uniforms.uAssemble.value = this.#intro.assemble;
    uniforms.uFront.value = this.#intro.front;
    uniforms.uSheen.value = this.#intro.charge;
    uniforms.uChrome.value = mix(from.chrome, to.chrome, t);
    uniforms.uRelief.value = mix(from.relief, to.relief, t) * (1 + this.#energy * 0.8);
    this.#glass = mix(from.glass, to.glass, t);
    uniforms.uAcid.value = 1 - this.#glass;
    this.#scale = mix(from.scale, to.scale, t);
    this.#roughness = mix(from.roughness, to.roughness, t);
    this.#material.metalness = mix(from.metalness, to.metalness, t);
    const iridescence = mix(mix(from.iridescence, to.iridescence, t), 1, charge);
    this.#material.iridescence = iridescence > 0.001 ? iridescence : 0;
    this.#material.envMapIntensity = mix(from.reflection, to.reflection, t) * (1 + charge * 0.6);
    this.#material.dispersion = mix(restingDispersion, 2.6, charge);
    this.#spin = mix(from.spin, to.spin, t);
    this.#applyGlass();
  }

  applyQuality(quality: QualitySettings): void {
    this.#fluid.applyQuality(quality);
    this.#transmission = quality.transmission;
    const segments = segmentsByTier[quality.tier];
    if (segments !== this.#segments) {
      this.#segments = segments;
      this.#mesh.geometry.dispose();
      this.#mesh.geometry = new PlaneGeometry(1, 1, ...segments);
      this.uniforms.uGrid.value.set(segments[0], segments[1]);
    }
    this.#material.transparent = !quality.transmission;
    this.#material.needsUpdate = true;
    this.#applyGlass();
  }

  update({ delta, elapsed }: FrameState): void {
    const step = Math.min(delta, 1 / 30);
    this.#fluid.update(step, elapsed, 1 + this.#energy * 3);
    this.uniforms.uEntityTime.value = elapsed;
    this.uniforms.uFluid.value = this.#fluid.texture;

    const drag = this.#pointer.takeDrag();
    this.#angular.y += drag.x * 5;
    this.#angular.x -= drag.y * 2.5;
    const damping = Math.exp(-step * 2.2);
    this.#angular.x *= damping;
    this.#angular.y *= damping;
    this.#spinAngle += (this.#spin + this.#angular.y) * step;
    this.#tilt = (this.#tilt + this.#angular.x * step) * Math.exp(-step * 0.9);

    this.object.position.copy(this.center);
    this.object.position.y += Math.sin(elapsed * 0.7) * 0.1;
    this.object.scale.setScalar(this.#scale * this.#intro.spread);
    this.#pivot.rotation.set(
      this.#tilt + Math.sin(elapsed * 0.31) * 0.06,
      this.#spinAngle + this.#intro.turn,
      0,
    );
    this.object.updateMatrixWorld();

    this.#updateHover(step);
    this.#updateTaps();
    this.#updateJelly(step);

    this.#rippleAge += step;
    this.uniforms.uRippleAge.value = this.#rippleAge;
    this.uniforms.uRippleStrength.value = Math.exp(-this.#rippleAge * 0.6) * this.#rippleGain;
  }

  prime(lead: number): void {
    this.#spinAngle = -this.#spin * lead;
    this.#angular.x = 0;
    this.#angular.y = 0;
  }

  burst(): void {
    const direction = this.#pivot.worldToLocal(local.copy(this.#camera.position)).normalize();
    this.uniforms.uRippleDirection.value.copy(direction);
    this.#rippleAge = 0;
    this.#rippleGain = 2.4;
    const [u, v] = surfaceUv(direction);
    this.#fluid.stir(u, v, 3);
  }

  dispose(): void {
    this.#mesh.geometry.dispose();
    this.#material.dispose();
    this.#fluid.dispose();
  }

  #applyGlass(): void {
    if (this.#transmission) {
      this.#material.transmission = this.#glass > 0.001 ? this.#glass : 0;
      this.#material.opacity = 1;
    } else {
      this.#material.transmission = 0;
      this.#material.opacity = 1 - this.#glass * 0.6;
    }
    this.#material.roughness = mix(this.#roughness, 0.04, this.#glass);
  }

  #raycast(x: number, y: number): Vector3 | null {
    raycaster.setFromCamera(pointerNdc.set(x, y), this.#camera);
    bounds.set(this.object.position, this.#scale * 1.08);
    if (!raycaster.ray.intersectSphere(bounds, hit)) {
      return null;
    }
    return this.#pivot.worldToLocal(local.copy(hit)).normalize();
  }

  #updateHover(step: number): void {
    const pointer = this.#pointer;
    const direction = pointer.hovering
      ? this.#raycast(pointer.position.x, pointer.position.y)
      : null;
    if (direction) {
      this.uniforms.uDentDirection.value.lerp(direction, 1 - Math.exp(-step / 0.08)).normalize();
      const speed = Math.hypot(pointer.velocity.x, pointer.velocity.y);
      const [u, v] = surfaceUv(direction);
      this.#fluid.stir(u, v, Math.min(0.25 + speed * 0.8, 1.6));
    }
    const hovered = direction !== null;
    if (hovered !== this.#hovered) {
      this.#hovered = hovered;
      window.dispatchEvent(new CustomEvent('scene-hover', { detail: hovered }));
    }
    const target = hovered ? 1 : 0;
    this.#dent += (target - this.#dent) * (1 - Math.exp(-step / 0.14));
    this.uniforms.uDent.value = this.#dent;
  }

  #updateTaps(): void {
    for (const tap of this.#pointer.takeTaps()) {
      const direction = this.#raycast(tap.x, tap.y);
      if (!direction) {
        continue;
      }
      this.uniforms.uRippleDirection.value.copy(direction);
      this.#rippleAge = 0;
      this.#rippleGain = 1;
      const [u, v] = surfaceUv(direction);
      this.#fluid.stir(u, v, 3);
      this.#angular.y += (Math.random() - 0.5) * 1.6;
    }
  }

  #updateJelly(step: number): void {
    right.setFromMatrixColumn(this.#camera.matrixWorld, 0);
    up.setFromMatrixColumn(this.#camera.matrixWorld, 1);
    const velocity = this.#pointer.hovering ? this.#pointer.velocity : { x: 0, y: 0 };
    jellyTarget
      .copy(right)
      .multiplyScalar(velocity.x * 0.035)
      .addScaledVector(up, velocity.y * 0.035);
    this.#pivot.getWorldQuaternion(inverse).invert();
    jellyTarget.applyQuaternion(inverse).clampLength(0, 0.22);
    this.#jellyVelocity.addScaledVector(jellyTarget.sub(this.#jelly), 55 * step);
    this.#jellyVelocity.multiplyScalar(Math.exp(-step * 6.5));
    this.#jelly.addScaledVector(this.#jellyVelocity, step).clampLength(0, 0.3);
    this.uniforms.uJelly.value.copy(this.#jelly);
  }
}
