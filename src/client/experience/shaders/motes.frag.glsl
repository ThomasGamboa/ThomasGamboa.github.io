uniform float uOpacity;

varying vec3 vColor;
varying float vFade;

void main() {
  float radial = length(gl_PointCoord - 0.5) * 2.0;
  float core = smoothstep(1.0, 0.0, radial);
  float alpha = core * core * vFade * uOpacity;
  if (alpha < 0.003) {
    discard;
  }
  gl_FragColor = vec4(vColor * alpha, alpha);
}
