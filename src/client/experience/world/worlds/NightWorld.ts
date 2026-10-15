import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three';
import { palette } from '../../../../shared/design/palette.ts';
import type { FrameState } from '../../core/Ticker.ts';
import haloFragment from '../../shaders/halo.frag.glsl?raw';
import noise from '../../shaders/noise.glsl?raw';
import planetFragment from '../../shaders/planet.frag.glsl?raw';
import planetVertex from '../../shaders/planet.vert.glsl?raw';
import type { CelestialBody, WorldLayout } from './layouts.ts';

export class NightWorld implements CelestialBody {
  readonly object = new Group();
  readonly chapterId: string;
  readonly #planet: Mesh<SphereGeometry, ShaderMaterial>;
  readonly #halo: Mesh<SphereGeometry, ShaderMaterial>;
  readonly #ring: Mesh<RingGeometry, MeshBasicMaterial>;
  readonly #moon: Mesh<SphereGeometry, ShaderMaterial>;
  readonly #ringOpacity = 0.22;
  readonly #planetUniforms = {
    uTime: { value: 0 },
    uPresence: { value: 0 },
    uLightDirection: { value: new Vector3(0.8, 0.35, 0.4).normalize() },
    uRim: { value: new Color(palette.signal).multiplyScalar(0.5) },
    uCity: { value: new Color(3.4, 1.5, 0.7) },
  };
  readonly #haloUniforms = {
    uColor: { value: new Color(palette.signal).multiplyScalar(0.55) },
    uPresence: { value: 0 },
    uPower: { value: 3.4 },
  };
  readonly #moonUniforms = {
    ...this.#planetUniforms,
    uCity: { value: new Color(0, 0, 0) },
    uRim: { value: new Color(0.6, 0.55, 0.7) },
  };

  constructor(chapterId: string, layout: WorldLayout) {
    this.chapterId = chapterId;
    const { radius } = layout;
    this.object.name = `world-${chapterId}`;
    this.object.position.set(...layout.center);

    const sphere = new SphereGeometry(radius, 96, 64);
    this.#planet = new Mesh(
      sphere,
      new ShaderMaterial({
        name: 'NightPlanet',
        vertexShader: planetVertex,
        fragmentShader: `${noise}\n${planetFragment}`,
        uniforms: this.#planetUniforms,
      }),
    );

    this.#halo = new Mesh(
      new SphereGeometry(radius * 1.12, 64, 32),
      new ShaderMaterial({
        name: 'NightHalo',
        vertexShader: planetVertex,
        fragmentShader: haloFragment,
        uniforms: this.#haloUniforms,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    );

    this.#ring = new Mesh(
      new RingGeometry(radius * 1.55, radius * 1.58, 160),
      new MeshBasicMaterial({
        color: new Color(palette.signal).multiplyScalar(1.5),
        transparent: true,
        opacity: 0,
        side: DoubleSide,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.#ring.rotation.set(Math.PI * 0.42, 0.2, 0);

    this.#moon = new Mesh(
      new SphereGeometry(radius * 0.14, 32, 16),
      new ShaderMaterial({
        name: 'NightMoon',
        vertexShader: planetVertex,
        fragmentShader: `${noise}\n${planetFragment}`,
        uniforms: this.#moonUniforms,
      }),
    );

    this.object.add(this.#planet, this.#halo, this.#ring, this.#moon);
    this.object.visible = false;
  }

  setPresence(value: number): void {
    this.#planetUniforms.uPresence.value = value;
    this.#haloUniforms.uPresence.value = value;
    this.#ring.material.opacity = this.#ringOpacity * value;
    this.object.scale.setScalar(0.85 + value * 0.15);
    this.object.visible = value > 0.001;
  }

  update({ elapsed }: FrameState): void {
    if (!this.object.visible) {
      return;
    }
    this.#planetUniforms.uTime.value = elapsed;
    this.#planet.rotation.y = elapsed * 0.025;
    const orbit = elapsed * 0.12;
    const distance = this.#ring.geometry.parameters.outerRadius * 1.15;
    this.#moon.position.set(
      Math.cos(orbit) * distance,
      Math.sin(orbit) * distance * 0.25,
      Math.sin(orbit) * distance,
    );
  }

  dispose(): void {
    for (const mesh of [this.#planet, this.#halo, this.#moon]) {
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    this.#ring.geometry.dispose();
    this.#ring.material.dispose();
  }
}
