import { clamp01, smoothstep } from './timeline-math.ts';

export interface IntroHandlers {
  readonly onImpact?: () => void;
  readonly onReveal?: () => void;
  readonly onComplete?: () => void;
}

export interface IntroState {
  readonly assemble: number;
  readonly spread: number;
  readonly charge: number;
  readonly front: number;
  readonly light: number;
  readonly wave: number;
  readonly waveStrength: number;
  readonly flare: number;
  readonly emblem: number;
  readonly distance: number;
  readonly azimuth: number;
  readonly level: number;
  readonly rise: number;
  readonly fov: number;
  readonly turn: number;
  readonly dock: number;
}

const timing = {
  ignite: 0.7,
  assembleStart: 0.25,
  impact: 1.95,
  wave: 1.05,
  reveal: 0.12,
  dockDelay: 0.08,
  dock: 1.05,
  duration: 3.3,
  rush: 4,
} as const;

type Phase = 'idle' | 'armed' | 'playing' | 'done';

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

function easeOutCubic(x: number): number {
  return 1 - (1 - x) ** 3;
}

function easeOutExpo(x: number): number {
  return x >= 1 ? 1 : 1 - 2 ** (-10 * x);
}

function easeOutBack(x: number): number {
  const overshoot = 2.2;
  return 1 + (overshoot + 1) * (x - 1) ** 3 + overshoot * (x - 1) ** 2;
}

export class Intro implements IntroState {
  assemble = 1;
  spread = 1;
  charge = 0;
  front = 0;
  light = 1;
  wave = 0;
  waveStrength = 0;
  flare = 0;
  emblem = 1;
  distance = 1;
  azimuth = 0;
  level = 0;
  rise = 0;
  fov = 0;
  turn = 0;
  dock = 1;
  #phase: Phase = 'idle';
  #time = 0;
  #handlers: IntroHandlers = {};
  #impacted = false;
  #revealed = false;

  get impactTime(): number {
    return timing.impact;
  }

  get active(): boolean {
    return this.#phase === 'armed' || this.#phase === 'playing';
  }

  arm(): void {
    this.#phase = 'armed';
    this.#time = 0;
    this.#compute(0);
  }

  cancel(): void {
    if (this.active) {
      this.#handlers = {};
      this.#finish();
    }
  }

  play(handlers: IntroHandlers): void {
    if (this.#phase !== 'armed') {
      handlers.onReveal?.();
      handlers.onComplete?.();
      return;
    }
    this.#handlers = handlers;
    this.#phase = 'playing';
  }

  update(delta: number, rush: boolean): void {
    if (this.#phase !== 'playing') {
      return;
    }
    this.#time += delta * (rush ? timing.rush : 1);
    const time = this.#time;
    if (!this.#impacted && time >= timing.impact) {
      this.#impacted = true;
      this.#handlers.onImpact?.();
    }
    if (!this.#revealed && time >= timing.impact + timing.reveal) {
      this.#revealed = true;
      this.#handlers.onReveal?.();
    }
    if (time >= timing.duration) {
      this.#finish();
      return;
    }
    this.#compute(time);
  }

  #finish(): void {
    this.#phase = 'done';
    this.assemble = 1;
    this.spread = 1;
    this.charge = 0;
    this.front = 0;
    this.light = 1;
    this.wave = 0;
    this.waveStrength = 0;
    this.flare = 0;
    this.emblem = 1;
    this.distance = 1;
    this.azimuth = 0;
    this.level = 0;
    this.rise = 0;
    this.fov = 0;
    this.turn = 0;
    this.dock = 1;
    this.#handlers.onComplete?.();
    this.#handlers = {};
  }

  #compute(time: number): void {
    const { impact } = timing;
    const flow = easeInOutCubic(clamp01(time / impact));
    const after = time - impact;
    const wave = clamp01(after / timing.wave);

    const pop = after > 0 ? 0.075 * Math.exp(-after * 5.5) * Math.cos(after * 15) : 0;
    this.spread = 0.04 + 0.96 * easeOutExpo(clamp01(time / timing.ignite)) + pop;
    this.assemble = easeInOutCubic(
      clamp01((time - timing.assembleStart) / (impact - timing.assembleStart)),
    );
    this.charge = 1 - smoothstep(impact - 0.3, impact + 0.9, time);
    this.front = smoothstep(0.15, 0.7, time) * (1 - smoothstep(impact - 0.45, impact - 0.05, time));
    this.light =
      0.16 +
      0.2 * smoothstep(0.3, impact, time) +
      0.64 * smoothstep(0.55, 1, wave) * (after > 0 ? 1 : 0);
    this.wave = after > 0 ? easeOutCubic(wave) : 0;
    this.waveStrength = after > 0 ? (1 - wave) ** 1.4 : 0;
    this.flare =
      after > 0 ? Math.exp(-after / 0.32) : 0.35 * smoothstep(impact - 0.7, impact, time);
    this.emblem = after > 0 ? easeOutBack(clamp01(after / 0.55)) : 0;
    this.distance = 1 + 0.6 * (1 - flow);
    this.azimuth = -1.1 * (1 - flow);
    this.level = 1 - flow;
    this.rise = 0.38 * Math.sin(Math.PI * flow);
    this.fov = 5 * (1 - flow);
    this.turn = -2.6 * (1 - flow) ** 2;
    this.dock = easeInOutCubic(clamp01((after - timing.dockDelay) / timing.dock));
  }
}
