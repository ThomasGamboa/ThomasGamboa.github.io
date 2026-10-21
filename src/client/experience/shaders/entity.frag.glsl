uniform sampler2D uFluid;
uniform vec3 uPaletteA[5];
uniform vec3 uPaletteB[5];
uniform float uPaletteMix;
uniform float uAcid;
uniform float uGlow;
uniform float uRim;
uniform float uBands;
uniform vec2 uFluidOffset;
uniform sampler2D uFilmMap;
uniform mat3 uFilmRotation;
uniform float uFilm;
uniform float uRelief;
uniform float uChrome;
uniform float uFront;
uniform float uSheen;

varying vec2 vEntityUv;
varying float vEntityTube;
varying vec3 vEntityTangent;
varying vec3 vEntityBitangent;
varying float vEntityFront;

vec3 entitySpectrum(float x) {
  return 0.5 + 0.5 * cos(6.28318 * (x + vec3(0.0, 0.33, 0.67)));
}

vec3 paletteAt(float x) {
  x = fract(x) * 5.0;
  float index = floor(x);
  float blend = smoothstep(0.18, 0.82, x - index);
  int first = int(index);
  int second = int(mod(index + 1.0, 5.0));
  vec3 a = mix(uPaletteA[first], uPaletteA[second], blend);
  vec3 b = mix(uPaletteB[first], uPaletteB[second], blend);
  return mix(a, b, uPaletteMix);
}

vec4 fluidAt(vec2 uv) {
  vec2 sphereUv = uv + uFluidOffset;
  vec2 tubeUv = vec2(uv.x * 3.0, 1.0 - abs(uv.y * 2.0 - 1.0) * 0.5) + uFluidOffset;
  return mix(texture2D(uFluid, sphereUv), texture2D(uFluid, tubeUv), vEntityTube);
}

vec4 fluidSample() {
  return fluidAt(vEntityUv);
}

float reliefHeight(vec2 uv) {
  vec4 field = fluidAt(uv);
  return field.r * 0.7 + field.g * 0.3;
}

vec2 reliefSlope() {
  vec2 stride = vec2(0.0035, 0.006);
  float center = reliefHeight(vEntityUv);
  float alongU = reliefHeight(vEntityUv + vec2(stride.x, 0.0)) - center;
  float alongV = reliefHeight(vEntityUv + vec2(0.0, stride.y)) - center;
  return vec2(alongU, alongV) / stride / vec2(6.2832, 3.1416);
}

vec3 acidAlbedo(vec4 field) {
  vec2 warp = field.rg * 0.05;
  vec4 detail = texture2D(uFluid, vEntityUv * vec2(2.0, 1.5) + warp + uFluidOffset + 0.37);
  float phase = field.r * uBands + field.g * 0.3 + detail.r * 0.55;
  vec3 color = paletteAt(phase);
  float shade = smoothstep(-0.6, 0.5, field.g + detail.g * 0.35);
  color *= mix(0.32, 1.0, shade);
  color += paletteAt(phase + 0.4) * field.b * 0.6;
  return color;
}
