varying vec2 vPlane;
varying vec3 vWorld;

void main() {
  vPlane = position.xy;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
