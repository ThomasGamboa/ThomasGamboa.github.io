varying vec3 vFilmDirection;

void main() {
  vFilmDirection = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
