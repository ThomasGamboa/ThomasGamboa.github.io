uniform vec3 uColor;
uniform float uPresence;
uniform float uPower;

varying vec3 vNormal;
varying vec3 vObject;
varying vec3 vWorld;

void main() {
  vec3 viewDirection = normalize(cameraPosition - vWorld);
  float facing = max(dot(viewDirection, normalize(vNormal)), 0.0);
  float glow = pow(1.0 - facing, uPower) * smoothstep(0.0, 0.22, facing);
  gl_FragColor = vec4(uColor * glow * uPresence, 1.0);
}
