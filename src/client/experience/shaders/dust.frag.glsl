uniform float uTime;
uniform float uOpacity;
uniform vec3 uColor;
uniform vec3 uAccent;

varying float vSeed;
varying float vDepthFade;

void main() {
  float radial = length(gl_PointCoord - 0.5) * 2.0;
  float core = pow(max(1.0 - radial, 0.0), 2.4);
  float twinkle = 0.6 + 0.4 * sin(uTime * (1.2 + vSeed * 3.0) + vSeed * 40.0);
  vec3 color = mix(uColor, uAccent, step(0.82, vSeed));
  float alpha = core * twinkle * vDepthFade * uOpacity;
  if (alpha < 0.002) {
    discard;
  }
  gl_FragColor = vec4(color * alpha, alpha);
}
