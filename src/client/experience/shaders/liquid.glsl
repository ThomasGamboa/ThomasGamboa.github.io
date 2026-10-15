uniform float uLiquidTime;
uniform float uLiquidSeed;
uniform float uLiquidScale;
uniform float uLiquidBump;
uniform float uLiquidFilm;
uniform vec3 uLiquidInk0;
uniform vec3 uLiquidInk1;
uniform vec3 uLiquidInk2;
uniform vec3 uLiquidInk3;

varying vec3 vLiquidPosition;

float fbm2(vec3 p) {
  return snoise(p) * 0.66 + snoise(p * 2.03 + 3.7) * 0.34;
}

vec3 liquidInk(float x) {
  x = fract(x);
  vec3 color = mix(uLiquidInk0, uLiquidInk1, smoothstep(0.0, 0.3, x));
  color = mix(color, uLiquidInk2, smoothstep(0.3, 0.55, x));
  color = mix(color, uLiquidInk3, smoothstep(0.55, 0.8, x));
  return mix(color, uLiquidInk0, smoothstep(0.8, 1.0, x));
}

vec4 liquidMarble(vec3 position) {
  float time = uLiquidTime * 0.03;
  vec3 p = position * uLiquidScale + uLiquidSeed;
  vec3 q = vec3(
    fbm2(p + vec3(0.0, time, 0.0)),
    fbm2(p + vec3(5.2, 1.3, time)),
    fbm2(p + vec3(2.1, -time, 7.7))
  );
  float field = fbm2(p + 1.7 * q + vec3(1.7, 9.2, time));
  float flow = field + q.x * 0.6;
  vec3 color = liquidInk(flow * 0.85 + 0.5);
  float vein = pow(1.0 - abs(sin(flow * 7.0)), 24.0);
  color = mix(color, uLiquidInk2, vein * 0.5);
  color *= mix(0.18, 1.0, smoothstep(-0.6, 0.4, q.y + field * 0.4));
  return vec4(color, flow);
}

float liquidRipple(vec3 position) {
  float time = uLiquidTime * 0.2;
  return snoise(position * uLiquidScale + vec3(0.0, time, time * 0.6)) * 0.8
    + snoise(position * uLiquidScale * 1.9 - vec3(time, 0.0, 0.0)) * 0.2;
}

vec3 liquidPerturb(vec3 surfaceNormal, vec3 viewPosition, float height, float strength) {
  vec3 dpdx = dFdx(viewPosition);
  vec3 dpdy = dFdy(viewPosition);
  float dhdx = dFdx(height);
  float dhdy = dFdy(height);
  vec3 r1 = cross(dpdy, surfaceNormal);
  vec3 r2 = cross(surfaceNormal, dpdx);
  float determinant = dot(dpdx, r1);
  vec3 gradient = sign(determinant) * (dhdx * r1 + dhdy * r2);
  return normalize(abs(determinant) * surfaceNormal - gradient * strength);
}
