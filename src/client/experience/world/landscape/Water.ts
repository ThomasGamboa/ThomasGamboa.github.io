import { Color, Group, Matrix4, Mesh, PlaneGeometry, ShaderMaterial, Texture } from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { palette } from '../../../../shared/design/palette.ts';
import type { QualitySettings } from '../../core/quality.ts';
import type { FrameState } from '../../core/Ticker.ts';
import type { ViewportState } from '../../core/Viewport.ts';
import noise from '../../shaders/noise.glsl?raw';
import waterFragment from '../../shaders/water.frag.glsl?raw';
import waterVertex from '../../shaders/water.vert.glsl?raw';
import { eclipseDirection } from '../environment/Sky.ts';
import type { WorldModule } from '../WorldModule.ts';

const size = 600;

function createUniforms() {
  return {
    tDiffuse: { value: new Texture() },
    color: { value: new Color(0.5, 0.48, 0.5) },
    textureMatrix: { value: new Matrix4() },
    uTime: { value: 0 },
    uDistortion: { value: 0.035 },
    uFade: { value: 1 },
    uDeep: { value: new Color(0.0015, 0.001, 0.002) },
    uGlint: { value: new Color(palette.signal).multiplyScalar(0.9) },
    uGlintDirection: { value: eclipseDirection.clone() },
  };
}

type WaterUniforms = ReturnType<typeof createUniforms>;

export class Water implements WorldModule {
  readonly object = new Group();
  readonly #geometry = new PlaneGeometry(size, size);
  #surface: Mesh | Reflector | null = null;
  #uniforms: WaterUniforms = createUniforms();
  #reflectionScale = -1;
  #viewport: ViewportState;
  #fade = 1;

  constructor(viewport: ViewportState) {
    this.#viewport = viewport;
    this.object.name = 'water';
  }

  set fade(value: number) {
    this.#fade = value;
    this.#uniforms.uFade.value = value;
    this.object.visible = value > 0.001;
  }

  applyQuality(quality: QualitySettings): void {
    if (quality.reflectionScale === this.#reflectionScale) {
      return;
    }
    this.#reflectionScale = quality.reflectionScale;
    this.#build();
  }

  resize(viewport: ViewportState): void {
    this.#viewport = viewport;
    if (this.#surface instanceof Reflector) {
      const { width, height } = this.#reflectionSize();
      this.#surface.getRenderTarget().setSize(width, height);
    }
  }

  update({ elapsed }: FrameState): void {
    this.#uniforms.uTime.value = elapsed;
  }

  dispose(): void {
    this.#disposeSurface();
    this.#geometry.dispose();
  }

  #reflectionSize() {
    const { width, height, pixelRatio } = this.#viewport;
    const scale = this.#reflectionScale * pixelRatio;
    return {
      width: Math.max(Math.round(width * scale), 64),
      height: Math.max(Math.round(height * scale), 64),
    };
  }

  #build(): void {
    this.#disposeSurface();
    const shader = {
      name: 'MirrorWater',
      uniforms: createUniforms(),
      vertexShader: waterVertex,
      fragmentShader: `${noise}\n${waterFragment}`,
    };

    let surface: Mesh | Reflector;
    if (this.#reflectionScale > 0) {
      const { width, height } = this.#reflectionSize();
      surface = new Reflector(this.#geometry, {
        textureWidth: width,
        textureHeight: height,
        clipBias: 0.003,
        multisample: 0,
        shader,
      });
      const material = surface.material as ShaderMaterial;
      material.defines = { USE_REFLECTION: '' };
      this.#uniforms = material.uniforms as unknown as WaterUniforms;
    } else {
      const material = new ShaderMaterial({ ...shader, name: shader.name });
      surface = new Mesh(this.#geometry, material);
      this.#uniforms = material.uniforms as unknown as WaterUniforms;
    }

    this.#uniforms.uFade.value = this.#fade;
    surface.rotation.x = -Math.PI / 2;
    this.#surface = surface;
    this.object.add(surface);
  }

  #disposeSurface(): void {
    if (!this.#surface) {
      return;
    }
    this.object.remove(this.#surface);
    if (this.#surface instanceof Reflector) {
      this.#surface.dispose();
    } else {
      (this.#surface.material as ShaderMaterial).dispose();
    }
    this.#surface = null;
  }
}
