uniform float uLiquidTime;
uniform float uLiquidWarp;
uniform float uLiquidWarpScale;

varying vec3 vLiquidPosition;

vec3 liquidDisplace(vec3 point, vec3 direction) {
  float time = uLiquidTime * 0.18;
  float wave = snoise(point * uLiquidWarpScale + vec3(time, time * 0.7, -time * 0.4));
  wave += 0.5 * snoise(point * uLiquidWarpScale * 2.1 - vec3(0.0, time * 1.3, 0.0));
  return point + direction * wave * uLiquidWarp;
}

vec3 liquidTangent(vec3 direction) {
  vec3 helper = abs(direction.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  return normalize(cross(direction, helper));
}
