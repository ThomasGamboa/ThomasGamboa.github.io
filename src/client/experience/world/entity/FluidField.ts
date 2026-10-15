import {
  HalfFloatType,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RepeatWrapping,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  type Texture,
  Vector2,
  Vector3,
  type WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import type { QualitySettings } from '../../core/quality.ts';
import fluidFragment from '../../shaders/fluid.frag.glsl?raw';
import fluidVertex from '../../shaders/fluid.vert.glsl?raw';
import noise from '../../shaders/noise.glsl?raw';

function createTarget(width: number, height: number): WebGLRenderTarget {
  const target = new WebGLRenderTarget(width, height, {
    type: HalfFloatType,
    format: RGBAFormat,
    magFilter: LinearFilter,
    minFilter: LinearMipmapLinearFilter,
    generateMipmaps: true,
    depthBuffer: false,
  });
  target.texture.wrapS = RepeatWrapping;
  return target;
}

export class FluidField {
  readonly #renderer: WebGLRenderer;
  readonly #scene = new Scene();
  readonly #camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  readonly #quad: Mesh<PlaneGeometry, ShaderMaterial>;
  readonly #uniforms = {
    uPrevious: { value: null as Texture | null },
    uTime: { value: 0 },
    uDelta: { value: 0 },
    uInitialize: { value: 1 },
    uFlow: { value: 1 },
    uStir: { value: new Vector3() },
    uStirFlow: { value: new Vector2() },
  };
  #targets: [WebGLRenderTarget, WebGLRenderTarget];
  #width = 0;

  constructor(renderer: WebGLRenderer) {
    this.#renderer = renderer;
    this.#quad = new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({
        name: 'FluidField',
        vertexShader: fluidVertex,
        fragmentShader: `${noise}\n${fluidFragment}`,
        uniforms: this.#uniforms,
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.#quad.frustumCulled = false;
    this.#scene.add(this.#quad);
    this.#targets = [createTarget(512, 256), createTarget(512, 256)];
    this.#width = 512;
  }

  get texture(): Texture {
    return this.#targets[0].texture;
  }

  applyQuality(quality: QualitySettings): void {
    const width = quality.tier === 'low' ? 256 : 512;
    if (width === this.#width) {
      return;
    }
    this.#width = width;
    for (const target of this.#targets) {
      target.setSize(width, width / 2);
    }
    this.#uniforms.uInitialize.value = 1;
  }

  stir(u: number, v: number, strength: number, flowX = 0, flowY = 0): void {
    const current = this.#uniforms.uStir.value;
    current.set(u, v, Math.max(current.z, strength));
    this.#uniforms.uStirFlow.value.set(flowX, flowY);
  }

  update(delta: number, elapsed: number, flow: number): void {
    const [current, next] = this.#targets;
    this.#uniforms.uPrevious.value = current.texture;
    this.#uniforms.uTime.value = elapsed;
    this.#uniforms.uDelta.value = Math.min(delta, 1 / 20);
    this.#uniforms.uFlow.value = flow;

    const previousTarget = this.#renderer.getRenderTarget();
    this.#renderer.setRenderTarget(next);
    this.#renderer.render(this.#scene, this.#camera);
    this.#renderer.setRenderTarget(previousTarget);

    this.#targets = [next, current];
    this.#uniforms.uInitialize.value = 0;
    this.#uniforms.uStir.value.z *= 0.6;
  }

  dispose(): void {
    for (const target of this.#targets) {
      target.dispose();
    }
    this.#quad.geometry.dispose();
    this.#quad.material.dispose();
  }
}
