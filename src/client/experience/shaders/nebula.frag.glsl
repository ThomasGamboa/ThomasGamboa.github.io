uniform float uOpacity;

varying vec3 vColor;
varying float vFade;

void main() {
  float radial = length(gl_PointCoord - 0.5) * 2.0;
  float glow = pow(max(1.0 - radial, 0.0), 3.0);
  float alpha = glow * vFade * uOpacity;
  if (alpha < 0.002) {
    discard;
  }
  gl_FragColor = vec4(vColor * alpha, alpha);
}
