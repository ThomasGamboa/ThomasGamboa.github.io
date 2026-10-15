uniform float uTime;
uniform float uBirth;
uniform float uPixelRatio;
uniform float uSize;
uniform vec3 uOrigin;

attribute vec3 aOrbit;
attribute vec4 aTone;

varying vec3 vColor;
varying float vFade;

void main() {
  float radius = aOrbit.x;
  float angle = aOrbit.y + uTime * (0.6 / (radius + 6.0)) * aOrbit.z;
  vec3 cloud = vec3(cos(angle) * radius, position.y, position.z);
  cloud.y += sin(angle) * radius * 0.42;
  cloud.x += snoise(vec3(position.z * 0.02, aTone.w * 9.0, uTime * 0.03)) * 3.0;

  float delay = aTone.w * 0.45;
  float birth = smoothstep(delay, delay + 0.55, uBirth);
  vec3 world = mix(uOrigin, cloud, birth * birth * (3.0 - 2.0 * birth));

  vec4 viewPosition = modelViewMatrix * vec4(world, 1.0);
  float depth = -viewPosition.z;
  gl_PointSize = uSize * (0.4 + aTone.w * 1.1) * uPixelRatio / max(depth, 0.8);
  vFade = smoothstep(260.0, 18.0, depth) * smoothstep(0.6, 4.0, depth) * smoothstep(0.0, 0.15, birth);
  vColor = aTone.rgb;
  gl_Position = projectionMatrix * viewPosition;
}
