uniform float uEntityTime;
uniform int uShapeA;
uniform int uShapeB;
uniform float uMorph;
uniform float uWobble;
uniform float uTurbulence;
uniform vec3 uDentDirection;
uniform float uDent;
uniform vec3 uRippleDirection;
uniform float uRippleAge;
uniform float uRippleStrength;
uniform vec3 uJelly;
uniform vec2 uGrid;
uniform float uSeed;

varying vec2 vEntityUv;
varying float vEntityTube;

const float ENTITY_TAU = 6.28318530718;
const float ENTITY_PI = 3.14159265359;

float entityHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 sphereShape(vec2 uv) {
  float theta = uv.x * ENTITY_TAU;
  float phi = (1.0 - uv.y) * ENTITY_PI;
  return vec3(-cos(theta) * sin(phi), cos(phi), sin(theta) * sin(phi));
}

vec3 cubeShape(vec2 uv) {
  vec3 d = sphereShape(uv);
  vec3 a = abs(d);
  float m = pow(pow(a.x, 12.0) + pow(a.y, 12.0) + pow(a.z, 12.0), 1.0 / 12.0);
  return d / max(m, 0.0001) * 0.82;
}

vec3 knotCurve(float t) {
  float radius = 0.64 + 0.3 * cos(5.0 * t);
  return vec3(-radius * cos(3.0 * t), 0.36 * sin(5.0 * t), radius * sin(3.0 * t));
}

vec3 knotShape(vec2 uv) {
  float t = uv.x * ENTITY_TAU;
  vec3 center = knotCurve(t);
  vec3 tangent = normalize(knotCurve(t + 0.004) - knotCurve(t - 0.004));
  vec3 outward = normalize(vec3(center.x, 0.0, center.z));
  vec3 binormal = normalize(cross(tangent, outward));
  vec3 normal = cross(binormal, tangent);
  float s = (uv.y - 0.5) * ENTITY_TAU;
  float tube = 0.1 * (1.0 + 0.45 * sin(t * 11.0 + uEntityTime * 0.7));
  return center + (normal * cos(s) - binormal * sin(s)) * tube;
}

vec3 voxelShape(vec2 uv) {
  vec2 cells = vec2(32.0, 16.0);
  vec2 cell = floor(uv * cells);
  vec3 center = sphereShape((cell + 0.5) / cells);
  vec3 d = sphereShape(uv);
  float level = floor(entityHash(cell + uSeed) * 4.0) / 3.0;
  float height = 0.86 + 0.16 * level;
  return d / max(dot(d, center), 0.35) * height;
}

vec3 ringShape(vec2 uv) {
  float t = uv.x * ENTITY_TAU;
  float s = (uv.y - 0.5) * ENTITY_TAU;
  vec3 outward = vec3(-cos(t), 0.0, sin(t));
  float tube = 0.05 * (1.0 + 0.3 * sin(t * 6.0 - uEntityTime * 0.8));
  return outward * (1.05 + tube * cos(s)) + vec3(0.0, tube * sin(s), 0.0);
}

vec3 shapeOf(int id, vec2 uv) {
  if (id == 1) {
    return cubeShape(uv);
  }
  if (id == 2) {
    return knotShape(uv);
  }
  if (id == 3) {
    return voxelShape(uv);
  }
  if (id == 4) {
    return ringShape(uv);
  }
  return sphereShape(uv);
}

float tubeOf(int id) {
  return id == 2 || id == 4 ? 1.0 : 0.0;
}

vec3 entitySurface(vec2 uv) {
  vec3 p = mix(shapeOf(uShapeA, uv), shapeOf(uShapeB, uv), uMorph);
  float t = uEntityTime * 0.22;
  vec3 q = p * 1.25 + vec3(uSeed, t, t * 0.7);
  vec3 flow = vec3(snoise(q), snoise(q + 11.3), snoise(q + 23.7));
  float energy = uWobble + uTurbulence * sin(ENTITY_PI * uMorph);
  p += flow * energy;

  vec3 direction = normalize(p + 0.00001);
  float dentFalloff = exp(-(1.0 - dot(direction, uDentDirection)) * 8.0);
  p *= 1.0 - uDent * 0.18 * dentFalloff;

  float angle = acos(clamp(dot(direction, uRippleDirection), -1.0, 1.0));
  float wave = sin(angle * 15.0 - uRippleAge * 9.0) * exp(-uRippleAge * 1.3) * exp(-angle * 1.4);
  p *= 1.0 + wave * 0.05 * uRippleStrength;

  p += uJelly * p.y;
  return p;
}
