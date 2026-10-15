import type { MeshPhysicalMaterial } from 'three';
import noise from '../shaders/noise.glsl?raw';

export interface SoapFilmUniforms {
  readonly uFilmTime: { value: number };
  readonly uFilmStrength: { value: number };
  readonly uFilmScale: { value: number };
}

export function createSoapFilmUniforms(strength = 1, scale = 1.6): SoapFilmUniforms {
  return {
    uFilmTime: { value: 0 },
    uFilmStrength: { value: strength },
    uFilmScale: { value: scale },
  };
}

const header = `uniform float uFilmTime;
uniform float uFilmStrength;
uniform float uFilmScale;
${noise}
`;

const film = `
  vec3 filmView = normalize(vViewPosition);
  float facing = abs(dot(normalize(normal), filmView));
  float rim = pow(1.0 - facing, 2.2);
  float swirl = snoise(vec3(vViewPosition.xy * uFilmScale, uFilmTime * 0.05)) * 0.5 + 0.5;
  vec3 interference = spectrum(facing * 2.4 + swirl * 0.55 + uFilmTime * 0.015);
  outgoingLight += interference * (0.014 + rim * 0.85) * uFilmStrength;
  #include <opaque_fragment>`;

export function applySoapFilm(material: MeshPhysicalMaterial, uniforms: SoapFilmUniforms): void {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = `${header}${shader.fragmentShader}`.replace(
      '#include <opaque_fragment>',
      film,
    );
  };
  material.customProgramCacheKey = () => 'soap-film';
}
