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
import type { FilmReflections } from '../environment/Reflections.ts';

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

export function createEntityUniforms(
  palette: Palette,
  segments: readonly [number, number],
  film: FilmReflections,
) {
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
    uFilmMap: { value: film.texture },
    uFilmRotation: { value: film.rotation },
    uFilm: { value: 0 },
    uRelief: { value: 0 },
    uChrome: { value: 0 },
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
  vEntityTangent = (modelViewMatrix * vec4(entityAlongU, 0.0)).xyz;
  vEntityBitangent = (modelViewMatrix * vec4(entityAlongV, 0.0)).xyz;
  vEntityTube = mix(tubeOf(uShapeA), tubeOf(uShapeB), uMorph);
  #ifdef USE_TANGENT
    vec3 objectTangent = vec3(tangent.xyz);
  #endif`;

const colorChunk = `
  #include <color_fragment>
  vec4 entityField = fluidSample();
  vec3 entityAlbedo = acidAlbedo(entityField);
  vec3 entityHue = entityAlbedo / max(max(entityAlbedo.r, max(entityAlbedo.g, entityAlbedo.b)), 0.08);
  vec3 entityMetal = mix(entityAlbedo, entityHue * 0.92, uChrome);
  diffuseColor.rgb = mix(diffuseColor.rgb, entityMetal, uAcid);`;

const reliefChunk = `
  #include <normal_fragment_maps>
  if (uRelief > 0.0001) {
    vec3 entityTangent = vEntityTangent / max(length(vEntityTangent), 1e-6);
    vec3 entityBitangent = vEntityBitangent / max(length(vEntityBitangent), 1e-6);
    vec2 entitySlope = reliefSlope();
    normal = normalize(normal - uRelief * faceDirection * (entitySlope.x * entityTangent + entitySlope.y * entityBitangent));
  }`;

const environmentChunk = `
  #ifdef USE_ENVMAP
    #ifdef ENVMAP_TYPE_CUBE_UV
      vec3 entityEnvironment(vec3 direction, float roughness) {
        vec3 studio = textureCubeUV(envMap, envMapRotation * direction, roughness).rgb;
        vec3 film = textureCubeUV(uFilmMap, uFilmRotation * direction, roughness).rgb;
        return mix(studio, film, uFilm);
      }
    #endif
    vec3 getIBLIrradiance(const in vec3 normal) {
      #ifdef ENVMAP_TYPE_CUBE_UV
        vec3 worldNormal = transformNormalByInverseViewMatrix(normal, viewMatrix);
        return PI * entityEnvironment(worldNormal, 1.0) * envMapIntensity;
      #else
        return vec3(0.0);
      #endif
    }
    vec3 getIBLRadiance(const in vec3 viewDir, const in vec3 normal, const in float roughness) {
      #ifdef ENVMAP_TYPE_CUBE_UV
        vec3 reflectVec = reflect(-viewDir, normal);
        reflectVec = normalize(mix(reflectVec, normal, pow4(roughness)));
        reflectVec = transformDirectionByInverseViewMatrix(reflectVec, viewMatrix);
        return entityEnvironment(reflectVec, roughness) * envMapIntensity;
      #else
        return vec3(0.0);
      #endif
    }
  #endif`;

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
      .replace('#include <envmap_physical_pars_fragment>', environmentChunk)
      .replace('#include <normal_fragment_maps>', reliefChunk)
      .replace('#include <color_fragment>', colorChunk)
      .replace('#include <emissivemap_fragment>', emissiveChunk)
      .replace('#include <opaque_fragment>', rimChunk);
  };
  material.customProgramCacheKey = () => 'entity';
  return material;
}
