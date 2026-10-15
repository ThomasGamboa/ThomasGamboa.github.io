import { Color, type ColorRepresentation, MeshPhysicalMaterial } from 'three';
import liquidFragment from '../shaders/liquid.glsl?raw';
import liquidVertex from '../shaders/liquid-vertex.glsl?raw';
import noise from '../shaders/noise.glsl?raw';

export type LiquidInks = readonly [
  ColorRepresentation,
  ColorRepresentation,
  ColorRepresentation,
  ColorRepresentation,
];

export interface LiquidOptions {
  readonly inks: LiquidInks;
  readonly seed?: number;
  readonly scale?: number;
  readonly bump?: number;
  readonly film?: number;
  readonly warp?: number;
  readonly warpScale?: number;
  readonly marble?: boolean;
}

export interface LiquidUniforms {
  readonly uLiquidTime: { value: number };
  readonly uLiquidSeed: { value: number };
  readonly uLiquidScale: { value: number };
  readonly uLiquidBump: { value: number };
  readonly uLiquidFilm: { value: number };
  readonly uLiquidWarp: { value: number };
  readonly uLiquidWarpScale: { value: number };
  readonly uLiquidInk0: { value: Color };
  readonly uLiquidInk1: { value: Color };
  readonly uLiquidInk2: { value: Color };
  readonly uLiquidInk3: { value: Color };
}

export function createLiquidUniforms(options: LiquidOptions): LiquidUniforms {
  const [ink0, ink1, ink2, ink3] = options.inks;
  return {
    uLiquidTime: { value: 0 },
    uLiquidSeed: { value: options.seed ?? 0 },
    uLiquidScale: { value: options.scale ?? 0.6 },
    uLiquidBump: { value: options.bump ?? 0 },
    uLiquidFilm: { value: options.film ?? 0 },
    uLiquidWarp: { value: options.warp ?? 0 },
    uLiquidWarpScale: { value: options.warpScale ?? 0.5 },
    uLiquidInk0: { value: new Color(ink0) },
    uLiquidInk1: { value: new Color(ink1) },
    uLiquidInk2: { value: new Color(ink2) },
    uLiquidInk3: { value: new Color(ink3) },
  };
}

const vertexNormal = `
  vec3 liquidBase = position;
  vec3 liquidDirection = normalize(normal);
  #ifdef LIQUID_WARP
    vec3 liquidPoint = liquidDisplace(liquidBase, liquidDirection);
    vec3 liquidT = liquidTangent(liquidDirection);
    vec3 liquidB = cross(liquidDirection, liquidT);
    vec3 liquidPT = liquidDisplace(liquidBase + liquidT * 0.02, liquidDirection);
    vec3 liquidPB = liquidDisplace(liquidBase + liquidB * 0.02, liquidDirection);
    vec3 objectNormal = normalize(cross(liquidPT - liquidPoint, liquidPB - liquidPoint));
  #else
    vec3 liquidPoint = liquidBase;
    vec3 objectNormal = liquidDirection;
  #endif
  #ifdef USE_TANGENT
    vec3 objectTangent = vec3(tangent.xyz);
  #endif`;

const vertexPosition = `
  vec3 transformed = liquidPoint;
  vLiquidPosition = liquidBase;
  #ifdef USE_INSTANCING
    vLiquidPosition = (instanceMatrix * vec4(liquidBase, 1.0)).xyz;
  #endif`;

const fragmentColor = `
  #include <color_fragment>
  vec4 liquidSample = liquidMarble(vLiquidPosition);
  #ifdef LIQUID_MARBLE
    diffuseColor.rgb *= liquidSample.rgb;
  #endif`;

const fragmentNormal = `
  #include <normal_fragment_maps>
  if (uLiquidBump > 0.0) {
    normal = liquidPerturb(normal, -vViewPosition, liquidRipple(vLiquidPosition), uLiquidBump);
  }`;

const fragmentFilm = `
  if (uLiquidFilm > 0.0) {
    float liquidFacing = abs(dot(normal, normalize(vViewPosition)));
    float liquidRim = pow(1.0 - liquidFacing, 3.5) + 0.012;
    vec3 liquidSpectrum = spectrum(liquidFacing * 1.4 + liquidSample.a * 0.25 + uLiquidTime * 0.01);
    outgoingLight += liquidSpectrum * liquidRim * uLiquidFilm;
  }
  #include <opaque_fragment>`;

export function applyLiquid(
  material: MeshPhysicalMaterial,
  uniforms: LiquidUniforms,
  options: Pick<LiquidOptions, 'marble' | 'warp'>,
): MeshPhysicalMaterial {
  const warp = (options.warp ?? 0) > 0;
  const marble = options.marble ?? true;
  material.defines = {
    ...material.defines,
    ...(warp ? { LIQUID_WARP: '' } : {}),
    ...(marble ? { LIQUID_MARBLE: '' } : {}),
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = `${noise}\n${liquidVertex}\n${shader.vertexShader}`
      .replace('#include <beginnormal_vertex>', vertexNormal)
      .replace('#include <begin_vertex>', vertexPosition);
    shader.fragmentShader = `${noise}\n${liquidFragment}\n${shader.fragmentShader}`
      .replace('#include <color_fragment>', fragmentColor)
      .replace('#include <normal_fragment_maps>', fragmentNormal)
      .replace('#include <opaque_fragment>', fragmentFilm);
  };
  material.customProgramCacheKey = () => `liquid-${warp ? 'w' : 's'}-${marble ? 'm' : 'p'}`;
  return material;
}

export function createLiquidMaterial(
  options: LiquidOptions,
  parameters: ConstructorParameters<typeof MeshPhysicalMaterial>[0] = {},
): { material: MeshPhysicalMaterial; uniforms: LiquidUniforms } {
  const uniforms = createLiquidUniforms(options);
  const material = applyLiquid(new MeshPhysicalMaterial(parameters), uniforms, options);
  return { material, uniforms };
}
