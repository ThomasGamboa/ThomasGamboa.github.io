uniform sampler2D uFluid;
uniform vec3 uPaletteA[5];
uniform vec3 uPaletteB[5];
uniform float uPaletteMix;
uniform float uAcid;
uniform float uGlow;
uniform float uRim;
uniform float uBands;
uniform vec2 uFluidOffset;

varying vec2 vEntityUv;
varying float vEntityTube;

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

vec4 fluidSample() {
  vec2 sphereUv = vEntityUv + uFluidOffset;
  vec2 tubeUv = vec2(vEntityUv.x * 3.0, 1.0 - abs(vEntityUv.y * 2.0 - 1.0) * 0.5) + uFluidOffset;
  return mix(texture2D(uFluid, sphereUv), texture2D(uFluid, tubeUv), vEntityTube);
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
