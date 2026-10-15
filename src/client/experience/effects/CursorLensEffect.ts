import { Effect, EffectAttribute } from 'postprocessing';
import { Uniform, Vector2 } from 'three';

const fragmentShader = `
uniform vec2 uCenter;
uniform vec2 uVelocity;
uniform float uRadius;
uniform float uStrength;
uniform float uAspect;

float lensOffset(float radius) {
  float depth = sqrt(max(1.0 - radius * radius, 0.0));
  return -0.38 * depth + 0.55 * (1.0 - depth);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (uStrength <= 0.001) {
    outputColor = inputColor;
    return;
  }
  vec2 delta = uv - uCenter;
  delta.x *= uAspect;
  float amount = length(uVelocity);
  vec2 along = amount > 0.0001 ? uVelocity / amount : vec2(1.0, 0.0);
  float stretch = 1.0 + amount;
  float parallel = dot(delta, along);
  vec2 shaped = along * (parallel / stretch) + (delta - along * parallel) * sqrt(stretch);
  float distanceToCenter = length(shaped) / uRadius;
  if (distanceToCenter >= 1.0) {
    outputColor = inputColor;
    return;
  }
  vec2 offset = delta * lensOffset(distanceToCenter) * uStrength;
  offset.x /= uAspect;
  float spread = 0.1 * smoothstep(0.4, 1.0, distanceToCenter) + 0.02;
  vec3 color;
  color.r = texture2D(inputBuffer, uv + offset * (1.0 - spread)).r;
  color.g = texture2D(inputBuffer, uv + offset).g;
  color.b = texture2D(inputBuffer, uv + offset * (1.0 + spread)).b;
  float rim = smoothstep(0.93, 0.995, distanceToCenter);
  color += rim * 0.05 * uStrength;
  outputColor = vec4(color, inputColor.a);
}
`;

export class CursorLensEffect extends Effect {
  constructor() {
    super('CursorLensEffect', fragmentShader, {
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, Uniform>([
        ['uCenter', new Uniform(new Vector2(0.5, 0.5))],
        ['uVelocity', new Uniform(new Vector2())],
        ['uRadius', new Uniform(0.06)],
        ['uStrength', new Uniform(0)],
        ['uAspect', new Uniform(1)],
      ]),
    });
  }

  configure(
    center: Vector2,
    velocity: Vector2,
    radius: number,
    strength: number,
    aspect: number,
  ): void {
    (this.uniforms.get('uCenter')?.value as Vector2 | undefined)?.copy(center);
    (this.uniforms.get('uVelocity')?.value as Vector2 | undefined)?.copy(velocity);
    this.#set('uRadius', radius);
    this.#set('uStrength', strength);
    this.#set('uAspect', aspect);
  }

  #set(name: string, value: number): void {
    const uniform = this.uniforms.get(name);
    if (uniform) {
      uniform.value = value;
    }
  }
}
