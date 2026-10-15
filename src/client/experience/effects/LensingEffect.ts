import { Effect } from 'postprocessing';
import { Uniform, Vector2 } from 'three';

const fragmentShader = `
uniform vec2 uCenter;
uniform float uRadius;
uniform float uStrength;
uniform float uAspect;

void mainUv(inout vec2 uv) {
  if (uStrength <= 0.0) {
    return;
  }
  vec2 delta = uv - uCenter;
  delta.x *= uAspect;
  float distanceToCenter = max(length(delta), 0.0001);
  float influence = smoothstep(uRadius * 7.0, uRadius * 1.6, distanceToCenter) * smoothstep(uRadius * 0.95, uRadius * 1.35, distanceToCenter);
  float bend = uStrength * uRadius * uRadius / max(distanceToCenter, uRadius * 0.9);
  delta -= (delta / distanceToCenter) * bend * influence;
  delta.x /= uAspect;
  uv = uCenter + delta;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  outputColor = inputColor;
}
`;

export class LensingEffect extends Effect {
  constructor() {
    super('LensingEffect', fragmentShader, {
      uniforms: new Map<string, Uniform>([
        ['uCenter', new Uniform(new Vector2(0.5, 0.5))],
        ['uRadius', new Uniform(0.05)],
        ['uStrength', new Uniform(0)],
        ['uAspect', new Uniform(1)],
      ]),
    });
  }

  configure(center: Vector2, radius: number, strength: number, aspect: number): void {
    const centerUniform = this.uniforms.get('uCenter');
    if (centerUniform) {
      (centerUniform.value as Vector2).copy(center);
    }
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
