uniform float uTime;
uniform float uPresence;
uniform vec3 uLightDirection;
uniform vec3 uRim;
uniform vec3 uCity;

varying vec3 vNormal;
varying vec3 vObject;
varying vec3 vWorld;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 surface = normalize(vObject);
  float continents = fbm(surface * 2.1);
  float relief = fbm(surface * 7.5 + continents * 1.6);
  float daylight = max(dot(normal, normalize(uLightDirection)), 0.0);

  float land = smoothstep(0.02, 0.22, continents);
  vec3 ocean = vec3(0.006, 0.005, 0.009);
  vec3 ground = mix(vec3(0.03, 0.02, 0.022), vec3(0.075, 0.05, 0.05), smoothstep(-0.2, 0.5, relief));
  vec3 color = mix(ocean, ground, land) * (0.08 + daylight * 1.1);

  float clusters = smoothstep(0.55, 0.8, snoise(surface * 34.0)) * smoothstep(0.1, 0.5, snoise(surface * 6.0 + 4.0));
  float night = 1.0 - smoothstep(0.0, 0.3, daylight);
  float flicker = 0.85 + 0.15 * sin(uTime * 2.3 + surface.x * 70.0 + surface.y * 40.0);
  color += uCity * clusters * land * night * flicker;

  float threads = smoothstep(0.985, 1.0, sin((surface.y + relief * 0.08) * 90.0)) * land * night;
  color += uCity * threads * 0.35;

  vec3 viewDirection = normalize(cameraPosition - vWorld);
  float rim = pow(1.0 - max(dot(viewDirection, normal), 0.0), 3.0);
  color += uRim * rim * (0.3 + daylight * 1.2);

  gl_FragColor = vec4(color * uPresence, 1.0);
}
