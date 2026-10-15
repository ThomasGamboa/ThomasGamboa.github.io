uniform float uTime;
uniform float uPresence;
uniform float uInner;
uniform float uOuter;
uniform vec3 uTint;

varying vec2 vPlane;
varying vec3 vWorld;

float caustic(vec2 polar, float shift) {
  float radius = polar.x + shift;
  float spiral = polar.y + log(max(radius, 0.001)) * 1.6 - uTime * (0.9 / (radius * 0.4 + 0.8));
  vec3 p = vec3(cos(spiral), sin(spiral), radius * 0.4 - uTime * 0.05);
  float ridge = 1.0 - abs(snoise(p));
  float fine = 1.0 - abs(snoise(p * 2.3 + 4.1));
  return pow(ridge, 28.0) + pow(fine, 40.0) * 0.4;
}

void main() {
  float radius = length(vPlane);
  vec2 polar = vec2(radius, atan(vPlane.y, vPlane.x));
  float span = clamp((radius - uInner) / (uOuter - uInner), 0.0, 1.0);
  float spread = 0.015 + span * 0.04;
  vec3 light = vec3(
    caustic(polar, -spread),
    caustic(polar, 0.0),
    caustic(polar, spread)
  );
  float envelope = smoothstep(0.0, 0.08, span) * (1.0 - smoothstep(0.15, 0.6, span));
  vec3 color = (light * 0.1 + vec3(dot(light, vec3(0.333))) * 0.04) * uTint;
  gl_FragColor = vec4(color * envelope * uPresence, 1.0);
}
