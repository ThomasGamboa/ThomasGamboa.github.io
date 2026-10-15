import {
  Color,
  type ColorRepresentation,
  MeshPhysicalMaterial,
  type MeshPhysicalMaterialParameters,
  type Texture,
  Vector2,
  Vector3,
} from 'three';
import entityFragment from '../../shaders/entity.frag.glsl?raw';
import entityVertex from '../../shaders/entity.vert.glsl?raw';
import noise from '../../shaders/noise.glsl?raw';

export type Palette = readonly [
  ColorRepresentation,
  ColorRepresentation,
  ColorRepresentation,
  ColorRepresentation,
  ColorRepresentation,
];

export function paletteColors(palette: Palette): Color[] {
  return palette.map((value) => new Color(value));
}

export function writePalette(target: readonly Color[], palette: Palette): void {
  palette.forEach((value, index) => {
    target[index]?.set(value);
  });
}

export function createEntityUniforms(palette: Palette, segments: readonly [number, number]) {
  return {
    uEntityTime: { value: 0 },
    uShapeA: { value: 0 },
    uShapeB: { value: 0 },
    uMorph: { value: 0 },
    uWobble: { value: 0 },
    uTurbulence: { value: 0 },
    uDentDirection: { value: new Vector3(0, 0, 1) },
    uDent: { value: 0 },
    uRippleDirection: { value: new Vector3(0, 0, 1) },
    uRippleAge: { value: 10 },
    uRippleStrength: { value: 0 },
    uJelly: { value: new Vector3() },
    uGrid: { value: new Vector2(...segments) },
    uSeed: { value: 0 },
    uFluid: { value: null as Texture | null },
    uPaletteA: { value: paletteColors(palette) },
    uPaletteB: { value: paletteColors(palette) },
    uPaletteMix: { value: 0 },
    uAcid: { value: 1 },
    uGlow: { value: 0 },
    uRim: { value: 0 },
    uBands: { value: 1.4 },
    uFluidOffset: { value: new Vector2() },
  };
}

export type EntityUniforms = ReturnType<typeof createEntityUniforms>;

const normalChunk = `
  vec2 entityStep = 1.0 / uGrid;
  vec3 entityPoint = entitySurface(uv);
  vec3 entityAlongU = entitySurface(uv + vec2(entityStep.x, 0.0)) - entityPoint;
  float entitySign = uv.y + entityStep.y > 1.0 ? -1.0 : 1.0;
  vec3 entityAlongV = (entitySurface(uv + vec2(0.0, entityStep.y * entitySign)) - entityPoint) * entitySign;
  vec3 entityCross = cross(entityAlongU, entityAlongV);
  float entityLength = length(entityCross);
  vec3 objectNormal = entityLength > 1e-8 ? entityCross / entityLength : normalize(entityPoint + 0.00001);
  vEntityUv = uv;
  vEntityTube = mix(tubeOf(uShapeA), tubeOf(uShapeB), uMorph);
  #ifdef USE_TANGENT
    vec3 objectTangent = vec3(tangent.xyz);
  #endif`;

const colorChunk = `
  #include <color_fragment>
  vec4 entityField = fluidSample();
  vec3 entityAlbedo = acidAlbedo(entityField);
  diffuseColor.rgb = mix(diffuseColor.rgb, entityAlbedo, uAcid);`;

const emissiveChunk = `
  #include <emissivemap_fragment>
  totalEmissiveRadiance += entityAlbedo * uGlow * uAcid;`;

const rimChunk = `
  float entityFacing = abs(dot(normal, normalize(vViewPosition)));
  outgoingLight += paletteAt(entityField.r * uBands + 0.25) * pow(1.0 - entityFacing, 3.0) * uRim;
  #include <opaque_fragment>`;

export function createEntityMaterial(
  uniforms: EntityUniforms,
  parameters: MeshPhysicalMaterialParameters,
): MeshPhysicalMaterial {
  const material = new MeshPhysicalMaterial(parameters);
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = `${noise}\n${entityVertex}\n${shader.vertexShader}`
      .replace('#include <beginnormal_vertex>', normalChunk)
      .replace('#include <begin_vertex>', 'vec3 transformed = entityPoint;');
    shader.fragmentShader = `${entityFragment}\n${shader.fragmentShader}`
      .replace('#include <color_fragment>', colorChunk)
      .replace('#include <emissivemap_fragment>', emissiveChunk)
      .replace('#include <opaque_fragment>', rimChunk);
  };
  material.customProgramCacheKey = () => 'entity';
  return material;
}
