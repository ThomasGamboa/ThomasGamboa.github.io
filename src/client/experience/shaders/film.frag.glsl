varying vec3 vFilmDirection;

void main() {
  vec3 direction = normalize(vFilmDirection);
  vec3 warp = vec3(fbm(direction * 1.4 + 3.1), fbm(direction * 1.4 + 7.4), fbm(direction * 1.4 + 1.7));
  float field = fbm(direction * 2.2 + warp * 1.6);
  float film = field * 2.6 + direction.y * 0.45 + warp.x * 0.5;
  float filaments = pow(1.0 - abs(sin(field * 7.0 + warp.y * 2.0)), 9.0);
  float veil = smoothstep(-0.05, 0.55, fbm(direction * 1.1 + 11.0));
  float pools = smoothstep(0.25, 0.7, fbm(direction * 0.8 - 5.0));
  vec3 base = mix(vec3(0.004, 0.003, 0.012), vec3(0.03, 0.014, 0.06), direction.y * 0.5 + 0.5);
  vec3 color = base;
  color += spectrum(film) * filaments * 2.8;
  color += spectrum(film + 0.35) * veil * 0.14;
  color += spectrum(film * 0.5 + 0.6) * pools * 0.75;
  float key = max(dot(direction, normalize(vec3(-0.45, 0.78, 0.42))), 0.0);
  color += vec3(1.0, 0.94, 1.08) * (pow(key, 28.0) * 4.0 + pow(key, 4.0) * 0.25);
  float under = max(dot(direction, normalize(vec3(0.6, -0.55, -0.3))), 0.0);
  color += spectrum(film + 0.15) * pow(under, 10.0) * 1.6;
  gl_FragColor = vec4(color, 1.0);
}
