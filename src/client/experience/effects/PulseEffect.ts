import { Effect, EffectAttribute } from 'postprocessing';
import { Uniform, Vector2 } from 'three';

const fragmentShader = `
uniform vec2 uCenter;
uniform float uAspect;
uniform float uRadius;
uniform float uWidth;
uniform float uStrength;
uniform float uLight;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 delta = uv - uCenter;
  delta.x *= uAspect;
  float dist = length(delta);
  vec2 direction = dist > 0.0001 ? delta / dist : vec2(0.0);
  float ring = (dist - uRadius) / uWidth;
  float crest = exp(-ring * ring);
  vec3 color = inputColor.rgb;
  if (uStrength > 0.001) {
    vec2 offset = direction * (-ring * crest * uStrength * 0.03);
    offset.x /= uAspect;
    color.r = texture2D(inputBuffer, uv + offset * 1.45).r;
    color.g = texture2D(inputBuffer, uv + offset).g;
    color.b = texture2D(inputBuffer, uv + offset * 0.55).b;
  }
  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float inside = uRadius > 0.0 ? 1.0 - smoothstep(uRadius - uWidth, uRadius, dist) : 0.0;
  float lit = max(uLight, inside);
  color *= mix(lit, 1.0, smoothstep(0.32, 0.9, luminance));
  outputColor = vec4(color, inputColor.a);
}
`;

export class PulseEffect extends Effect {
  constructor() {
    super('PulseEffect', fragmentShader, {
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, Uniform>([
        ['uCenter', new Uniform(new Vector2(0.5, 0.5))],
        ['uAspect', new Uniform(1)],
        ['uRadius', new Uniform(0)],
        ['uWidth', new Uniform(0.026)],
        ['uStrength', new Uniform(0)],
        ['uLight', new Uniform(1)],
      ]),
    });
  }

  configure(
    center: Vector2,
    aspect: number,
    radius: number,
    strength: number,
    light: number,
  ): void {
    (this.uniforms.get('uCenter')?.value as Vector2 | undefined)?.copy(center);
    this.#set('uAspect', aspect);
    this.#set('uRadius', radius);
    this.#set('uStrength', strength);
    this.#set('uLight', light);
  }

  #set(name: string, value: number): void {
    const uniform = this.uniforms.get(name);
    if (uniform) {
      uniform.value = value;
    }
  }
}
