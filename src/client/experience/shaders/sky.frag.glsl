uniform float uTime;
uniform float uSpace;
uniform vec3 uHorizon;
uniform vec3 uCorona;
uniform vec3 uEclipseDirection;
uniform float uEclipseSize;

varying vec3 vDirection;

#ifdef USE_SKY_MAP
uniform sampler2D uSkyMap;
uniform float uSkyIntensity;

vec2 equirectangularUv(vec3 direction) {
  return vec2(atan(direction.z, direction.x) * 0.15915494 + 0.5, asin(clamp(direction.y, -1.0, 1.0)) * 0.31830988 + 0.5);
}
#endif

float starField(vec3 direction, float scale, float threshold) {
  vec3 point = direction * scale;
  vec3 cell = floor(point);
  float seed = hash13(cell);
  vec3 center = vec3(hash13(cell + 1.7), hash13(cell + 5.3), hash13(cell + 9.1));
  float distanceToStar = length(fract(point) - center);
  float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + seed * 2.4) + seed * 61.0);
  return step(threshold, seed) * smoothstep(0.09, 0.0, distanceToStar) * twinkle;
}

void main() {
  vec3 direction = normalize(vDirection);
  float elevation = direction.y;

  float horizonBand = exp(-abs(elevation) * 42.0);
  float haze = exp(-max(elevation, 0.0) * 6.0) * smoothstep(-0.2, 0.0, elevation);
  vec3 atmosphere = uHorizon * (horizonBand * 1.4 + haze * 0.18);

  float bands = fbm(vec3(direction.x * 1.6, elevation * 5.0 - uTime * 0.015, direction.z * 1.6));
  float auroraMask = smoothstep(0.04, 0.32, elevation) * (1.0 - smoothstep(0.32, 0.85, elevation));
  atmosphere += spectrum(bands * 0.7 + elevation * 1.4 + uTime * 0.01) * smoothstep(0.1, 0.65, bands) * auroraMask * 0.018;

  float eclipseAngle = acos(clamp(dot(direction, normalize(uEclipseDirection)), -1.0, 1.0));
  float disk = smoothstep(uEclipseSize + 0.002, uEclipseSize - 0.002, eclipseAngle);
  float rim = max(eclipseAngle - uEclipseSize, 0.0);
  float flare = 0.55 + 0.45 * fbm(vec3(atan(direction.x - uEclipseDirection.x, direction.y - uEclipseDirection.y) * 3.0, rim * 18.0, uTime * 0.05));
  vec3 corona = mix(vec3(1.5, 1.4, 1.32), uCorona, smoothstep(0.0, 0.035, rim));
  vec3 eclipse = corona * (exp(-rim * 160.0) * 2.6 + exp(-rim * 26.0) * 0.16 * flare) * (1.0 - disk);

  float stars = starField(direction, 160.0, 0.982) + starField(direction, 380.0, 0.991) * 0.55;
  float starVisibility = mix(smoothstep(0.02, 0.45, elevation), 1.0, uSpace);

  vec3 nebula = vec3(0.0);
  float cloud = fbm(direction * 2.2 + vec3(0.0, uTime * 0.004, 0.0));
  nebula += mix(vec3(0.05, 0.004, 0.012), vec3(0.03, 0.01, 0.06), smoothstep(-0.2, 0.5, direction.x)) * smoothstep(-0.1, 0.7, cloud) * 1.6;

#ifdef USE_SKY_MAP
  vec3 groundedSky = texture2D(uSkyMap, equirectangularUv(direction)).rgb * uSkyIntensity;
  disk = 0.0;
#else
  vec3 groundedSky = (atmosphere + eclipse) * (1.0 - disk);
#endif
  vec3 color = mix(groundedSky, nebula, uSpace) + vec3(stars) * starVisibility * (1.0 - disk * (1.0 - uSpace));
  gl_FragColor = vec4(color, 1.0);
}
