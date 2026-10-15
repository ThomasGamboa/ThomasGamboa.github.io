uniform float uTime;
uniform float uPresence;
uniform float uInner;
uniform float uOuter;
uniform vec3 uHot;
uniform vec3 uWarm;
uniform vec3 uCool;
uniform vec3 uCenter;

varying vec2 vPlane;
varying vec3 vWorld;

void main() {
  float radius = length(vPlane);
  float angle = atan(vPlane.y, vPlane.x);
  float span = clamp((radius - uInner) / (uOuter - uInner), 0.0, 1.0);

  float swirl = angle + uTime * (1.4 / (radius * 0.35 + 0.6)) - log(radius) * 2.2;
  float streaks = fbm(vec3(cos(swirl) * 2.0, sin(swirl) * 2.0, radius * 0.9 - uTime * 0.12));
  streaks = 0.55 + 0.75 * streaks;

  vec3 temperature = mix(uHot, uWarm, smoothstep(0.0, 0.35, span));
  temperature = mix(temperature, uCool, smoothstep(0.35, 1.0, span));

  vec3 toCamera = normalize(cameraPosition - uCenter);
  vec2 approach = normalize(vec2(toCamera.x, -toCamera.z) + 0.0001);
  float doppler = 0.55 + 0.9 * max(dot(normalize(vec2(-sin(angle), cos(angle))), approach), 0.0);

  float edges = smoothstep(0.0, 0.04, span) * (1.0 - smoothstep(0.55, 1.0, span));
  float intensity = edges * streaks * doppler * (1.0 - span * 0.6);
  gl_FragColor = vec4(temperature * intensity * uPresence, 1.0);
}
