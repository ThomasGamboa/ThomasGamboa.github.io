uniform sampler2D tDiffuse;
uniform vec3 color;
uniform float uTime;
uniform float uDistortion;
uniform float uFade;
uniform vec3 uDeep;
uniform vec3 uGlint;
uniform vec3 uGlintDirection;

varying vec4 vReflectionUv;
varying vec3 vWorldPosition;

vec2 surfaceSlope(vec2 position) {
  vec3 broad = vec3(position * 0.11, uTime * 0.05);
  vec3 fine = vec3(position * 0.47, uTime * 0.11);
  vec2 slope = vec2(snoise(broad), snoise(broad + 17.3)) * 0.7;
  slope += vec2(snoise(fine + 3.1), snoise(fine + 41.7)) * 0.3;
  return slope * 0.12;
}

void main() {
  vec2 slope = surfaceSlope(vWorldPosition.xz);
  vec3 normal = normalize(vec3(-slope.x * 2.4, 1.0, -slope.y * 2.4));
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float fresnel = pow(1.0 - max(dot(viewDirection, normal), 0.0), 4.0);

  vec3 reflection = uDeep;
#ifdef USE_REFLECTION
  vec4 uv = vReflectionUv;
  uv.xy += slope * uDistortion * uv.w;
  reflection = texture2DProj(tDiffuse, uv).rgb * color;
#endif

  vec3 reflected = reflect(-viewDirection, normal);
  float glint = pow(max(dot(reflected, normalize(uGlintDirection)), 0.0), 220.0);
  float sheen = pow(max(dot(reflected, normalize(uGlintDirection)), 0.0), 12.0);

  vec3 surface = mix(uDeep, reflection, 0.25 + 0.75 * fresnel);
  surface += uGlint * (glint * 1.8 + sheen * 0.05);

  float distanceToCamera = length(vWorldPosition.xz - cameraPosition.xz);
  float horizonFade = exp(-distanceToCamera * 0.006);
  gl_FragColor = vec4(surface * horizonFade * uFade, 1.0);
}
