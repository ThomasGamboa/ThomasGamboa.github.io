uniform sampler2D uPrevious;
uniform float uTime;
uniform float uDelta;
uniform float uInitialize;
uniform float uFlow;
uniform vec3 uStir;
uniform vec2 uStirFlow;

varying vec2 vUv;

const float TAU = 6.28318530718;
const float PI = 3.14159265359;

vec3 direction(vec2 uv) {
  float theta = uv.x * TAU;
  float phi = (1.0 - uv.y) * PI;
  return vec3(-cos(theta) * sin(phi), cos(phi), sin(theta) * sin(phi));
}

float potential(vec3 p) {
  float t = uTime * 0.03;
  return snoise(p * 1.4 + vec3(0.0, t, t * 0.7)) + 0.4 * snoise(p * 3.1 - vec3(t, 0.0, 2.0));
}

vec2 flowAt(vec2 uv) {
  vec3 p = direction(uv);
  float e = 0.02;
  float n = potential(p);
  vec3 gradient = vec3(
    potential(p + vec3(e, 0.0, 0.0)) - n,
    potential(p + vec3(0.0, e, 0.0)) - n,
    potential(p + vec3(0.0, 0.0, e)) - n
  ) / e;
  vec3 tangentFlow = cross(p, gradient);
  float theta = uv.x * TAU;
  vec3 east = vec3(sin(theta), 0.0, cos(theta));
  vec3 north = cross(p, east);
  float latitude = max(sin((1.0 - uv.y) * PI), 0.08);
  return vec2(dot(tangentFlow, east) / (TAU * latitude), dot(tangentFlow, north) / PI);
}

vec2 wrapDelta(vec2 delta) {
  delta.x -= floor(delta.x + 0.5);
  return delta;
}

float sourcePhase(vec3 p) {
  float t = uTime * 0.012;
  return fbm(p * 1.3 + vec3(t, -t, 0.0)) * 1.4;
}

float sourceDensity(vec3 p) {
  float t = uTime * 0.02;
  return snoise(p * 1.9 + vec3(5.0, t, -t));
}

void main() {
  vec3 p = direction(vUv);
  if (uInitialize > 0.5) {
    gl_FragColor = vec4(sourcePhase(p), sourceDensity(p), 0.0, 1.0);
    return;
  }
  vec2 velocity = flowAt(vUv) * 0.14 * uFlow;
  vec2 toStir = wrapDelta(vUv - uStir.xy) * vec2(2.0, 1.0);
  float stirFalloff = exp(-dot(toStir, toStir) / 0.006) * uStir.z;
  velocity += (vec2(-toStir.y, toStir.x) * 1.8 + uStirFlow) * stirFalloff;

  vec4 previous = texture2D(uPrevious, vUv - velocity * uDelta);
  float relax = 1.0 - exp(-uDelta * 0.12);
  float phase = mix(previous.r, sourcePhase(p), relax);
  float density = mix(previous.g, sourceDensity(p), relax * 1.4);
  phase += stirFalloff * uDelta * 1.2;
  float energy = max(previous.b * exp(-uDelta * 1.5), stirFalloff);
  gl_FragColor = vec4(phase, density, energy, 1.0);
}
