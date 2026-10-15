uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;

attribute float aSeed;

varying float vSeed;
varying float vDepthFade;

void main() {
  vec3 drifted = position;
  float phase = aSeed * 6.2831;
  drifted.x += sin(uTime * 0.11 + phase) * 0.9;
  drifted.y += sin(uTime * 0.17 + phase * 1.7) * 0.45 + mod(uTime * 0.05 * (0.4 + aSeed), 1.0) * 0.6;
  drifted.z += cos(uTime * 0.09 + phase * 2.3) * 0.9;

  vec4 viewPosition = modelViewMatrix * vec4(drifted, 1.0);
  float depth = -viewPosition.z;
  gl_PointSize = uSize * (0.35 + aSeed) * uPixelRatio / max(depth, 0.5);
  vDepthFade = smoothstep(80.0, 6.0, depth) * smoothstep(0.4, 2.0, depth);
  vSeed = aSeed;
  gl_Position = projectionMatrix * viewPosition;
}
