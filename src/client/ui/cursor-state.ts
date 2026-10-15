export const cursorState = {
  x: 0,
  y: 0,
  velocityX: 0,
  velocityY: 0,
  radius: 36,
  visible: false,
  overSurface: false,
};

export function lensOffset(radius: number): number {
  if (radius >= 1) {
    return 0;
  }
  const depth = Math.sqrt(1 - radius * radius);
  return -0.38 * depth + 0.55 * (1 - depth);
}
