uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;
uniform float uEnergy;
uniform vec3 uCenter;
uniform vec3 uRayOrigin;
uniform vec3 uRayDirection;
uniform float uRayActive;

attribute vec4 aOrbit;

varying vec3 vColor;
varying float vFade;

void main() {
  float radius = aOrbit.x;
  float speed = (0.05 + aOrbit.w * 0.06) * (1.0 + uEnergy * 4.0);
  float angle = aOrbit.y + uTime * speed / sqrt(radius);
  float lift = aOrbit.z;
  vec3 local = vec3(cos(angle) * radius, lift + sin(angle * 2.0 + aOrbit.w * 6.0) * 0.25, sin(angle) * radius);
  local.xz *= 1.0 + uEnergy * 0.18 * sin(angle * 3.0 + uTime);
  vec3 world = uCenter + local;

  vec3 toPoint = world - uRayOrigin;
  vec3 nearest = uRayOrigin + uRayDirection * max(dot(toPoint, uRayDirection), 0.0);
  vec3 away = world - nearest;
  float distanceToRay = length(away);
  float push = uRayActive * smoothstep(1.4, 0.0, distanceToRay);
  world += normalize(away + 0.0001) * push * 0.9;

  vec4 viewPosition = viewMatrix * vec4(world, 1.0);
  float depth = -viewPosition.z;
  gl_PointSize = uSize * (0.35 + aOrbit.w) * uPixelRatio / max(depth, 0.5);
  vFade = smoothstep(60.0, 6.0, depth) * smoothstep(0.5, 2.5, depth);
  vColor = spectrum(aOrbit.w * 2.0 + uTime * 0.03 + angle * 0.08) * (0.55 + push * 1.5 + uEnergy * 0.8);
  gl_Position = projectionMatrix * viewPosition;
}
