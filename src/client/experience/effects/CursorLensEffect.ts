import { Effect, EffectAttribute } from 'postprocessing';
import { Uniform, Vector2 } from 'three';

const fragmentShader = `
uniform vec2 uCenter;
uniform vec2 uVelocity;
uniform float uRadius;
uniform float uStrength;
uniform float uAspect;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (uStrength <= 0.001) {
    outputColor = inputColor;
    return;
  }
  vec2 delta = uv - uCenter;
  delta.x *= uAspect;
  vec2 velocity = uVelocity * vec2(uAspect, 1.0);
  float speed = length(velocity);
  vec2 along = speed > 0.0001 ? velocity / speed : vec2(1.0, 0.0);
  float stretch = 1.0 + min(speed * 2.2, 1.4);
  float parallel = dot(delta, along);
  vec2 shaped = along * (parallel / stretch) + (delta - along * parallel) * (1.0 + min(speed * 0.6, 0.35));
  float distanceToCenter = length(shaped) / uRadius;
  if (distanceToCenter >= 1.0) {
    outputColor = inputColor;
    return;
  }
  float dome = 1.0 - distanceToCenter * distanceToCenter;
  vec2 pull = -delta * dome * 0.42 * uStrength;
  pull += along * dome * min(speed * 0.04, 0.03) * uStrength;
  pull.x /= uAspect;
  float spread = (0.02 + 0.06 * distanceToCenter * distanceToCenter) * uStrength;
  vec3 color;
  color.r = texture2D(inputBuffer, uv + pull * (1.0 - spread)).r;
  color.g = texture2D(inputBuffer, uv + pull).g;
  color.b = texture2D(inputBuffer, uv + pull * (1.0 + spread)).b;
  float edge = smoothstep(0.9, 0.985, distanceToCenter) * (1.0 - smoothstep(0.985, 1.0, distanceToCenter));
  color += edge * 0.035 * uStrength;
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
