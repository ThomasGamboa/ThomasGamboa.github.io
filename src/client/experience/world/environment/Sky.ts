import {
  BackSide,
  type Camera,
  Color,
  Mesh,
  ShaderMaterial,
  SphereGeometry,
  type Texture,
  Vector3,
} from 'three';
import type { FrameState } from '../../core/Ticker.ts';
import noise from '../../shaders/noise.glsl?raw';
import skyFragment from '../../shaders/sky.frag.glsl?raw';
import skyVertex from '../../shaders/sky.vert.glsl?raw';
import type { WorldModule } from '../WorldModule.ts';

export const glintDirection = new Vector3(-0.35, 0.22, -1).normalize();

export function createSkyUniforms(skyMap: Texture | null = null) {
  return {
    uSkyMap: { value: skyMap },
    uSkyIntensity: { value: 1 },
    uTime: { value: 0 },
    uSpace: { value: 0 },
    uHorizon: { value: new Color(0.075, 0.07, 0.11) },
  };
}

export type SkyUniforms = ReturnType<typeof createSkyUniforms>;

export function createSkyMaterial(uniforms: SkyUniforms): ShaderMaterial {
  return new ShaderMaterial({
    name: 'Sky',
    vertexShader: skyVertex,
    fragmentShader: `${noise}\n${skyFragment}`,
    uniforms,
    defines: uniforms.uSkyMap.value ? { USE_SKY_MAP: '' } : {},
    side: BackSide,
    depthTest: false,
    depthWrite: false,
    fog: false,
  });
}

export class Sky implements WorldModule {
  readonly object: Mesh<SphereGeometry, ShaderMaterial>;
  readonly uniforms: SkyUniforms;
  readonly #camera: Camera;

  constructor(camera: Camera, skyMap: Texture | null) {
    this.#camera = camera;
    this.uniforms = createSkyUniforms(skyMap);
    this.object = new Mesh(new SphereGeometry(500, 48, 24), createSkyMaterial(this.uniforms));
    this.object.name = 'sky';
    this.object.renderOrder = -10;
    this.object.frustumCulled = false;
  }

  update({ elapsed }: FrameState): void {
    this.uniforms.uTime.value = elapsed;
    this.object.position.copy(this.#camera.position);
  }

  dispose(): void {
    this.object.geometry.dispose();
    this.object.material.dispose();
  }
}
