uniform float uTime;
uniform float uSpace;
uniform vec3 uHorizon;

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
  float twinkle = 0.6 + 0.4 * sin(uTime * (0.5 + seed * 2.0) + seed * 61.0);
  return step(threshold, seed) * smoothstep(0.08, 0.0, distanceToStar) * twinkle;
}

void main() {
  vec3 direction = normalize(vDirection);
  float elevation = direction.y;

  float horizonBand = exp(-abs(elevation) * 38.0);
  float haze = exp(-max(elevation, 0.0) * 7.0) * smoothstep(-0.2, 0.0, elevation);
  float sweep = atan(direction.z, direction.x) * 0.5 + uTime * 0.01;
  vec3 film = spectrum(sweep + elevation * 2.0) * 0.5 + 0.5;
  vec3 atmosphere = uHorizon * film * (horizonBand * 1.2 + haze * 0.12);

  float stars = starField(direction, 170.0, 0.986) + starField(direction, 400.0, 0.993) * 0.5;
  float starVisibility = mix(smoothstep(0.02, 0.4, elevation), 1.0, uSpace);
  vec3 starColor = mix(vec3(1.0), spectrum(hash13(floor(direction * 170.0)) * 3.0), 0.35);

  float cloud = fbm(direction * 1.6 + vec3(0.0, uTime * 0.003, 0.0));
  vec3 veil = spectrum(cloud * 0.8 + direction.x * 0.3 + 0.55) * smoothstep(0.15, 0.9, cloud) * 0.012;

#ifdef USE_SKY_MAP
  vec3 groundedSky = texture2D(uSkyMap, equirectangularUv(direction)).rgb * uSkyIntensity;
#else
  vec3 groundedSky = atmosphere;
#endif
  vec3 color = mix(groundedSky, veil, uSpace) + starColor * stars * starVisibility * 0.85;
  gl_FragColor = vec4(color, 1.0);
}
