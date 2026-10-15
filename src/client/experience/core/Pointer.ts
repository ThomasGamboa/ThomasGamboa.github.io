const easingSeconds = 0.6;
const velocitySeconds = 0.08;
const tapDistance = 12;
const tapSeconds = 0.45;
const ignoredSelector = 'a, button, input, select, textarea, label, summary, .surface';

export interface PointerTap {
  readonly x: number;
  readonly y: number;
}

export class Pointer {
  readonly smoothed = { x: 0, y: 0 };
  readonly position = { x: 0, y: 0 };
  readonly velocity = { x: 0, y: 0 };
  readonly drag = { x: 0, y: 0 };
  readonly #target = { x: 0, y: 0 };
  readonly #last = { x: 0, y: 0 };
  readonly #taps: PointerTap[] = [];
  #present = false;
  #hovering = false;
  #pressed = false;
  #pressStart = { x: 0, y: 0, time: 0 };

  constructor() {
    window.addEventListener('pointermove', this.#onMove, { passive: true });
    window.addEventListener('pointerdown', this.#onDown, { passive: true });
    window.addEventListener('pointerup', this.#onUp, { passive: true });
    window.addEventListener('pointercancel', this.#onCancel, { passive: true });
    document.documentElement.addEventListener('pointerleave', this.#onLeave);
  }

  get present(): boolean {
    return this.#present;
  }

  get hovering(): boolean {
    return this.#hovering;
  }

  get pressed(): boolean {
    return this.#pressed;
  }

  takeTaps(): PointerTap[] {
    return this.#taps.splice(0, this.#taps.length);
  }

  takeDrag(): { x: number; y: number } {
    const drag = { x: this.drag.x, y: this.drag.y };
    this.drag.x = 0;
    this.drag.y = 0;
    return drag;
  }

  update(delta: number): void {
    const blend = 1 - Math.exp(-delta / easingSeconds);
    this.smoothed.x += (this.#target.x - this.smoothed.x) * blend;
    this.smoothed.y += (this.#target.y - this.smoothed.y) * blend;

    const instant = delta > 0 ? 1 / delta : 0;
    const rawX = (this.position.x - this.#last.x) * instant;
    const rawY = (this.position.y - this.#last.y) * instant;
    const velocityBlend = 1 - Math.exp(-delta / velocitySeconds);
    this.velocity.x += (rawX - this.velocity.x) * velocityBlend;
    this.velocity.y += (rawY - this.velocity.y) * velocityBlend;
    this.#last.x = this.position.x;
    this.#last.y = this.position.y;
  }

  dispose(): void {
    window.removeEventListener('pointermove', this.#onMove);
    window.removeEventListener('pointerdown', this.#onDown);
    window.removeEventListener('pointerup', this.#onUp);
    window.removeEventListener('pointercancel', this.#onCancel);
    document.documentElement.removeEventListener('pointerleave', this.#onLeave);
  }

  #toNormalized(event: PointerEvent): { x: number; y: number } {
    return {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -((event.clientY / window.innerHeight) * 2 - 1),
    };
  }

  #isScene(event: PointerEvent): boolean {
    return !(event.target instanceof Element && event.target.closest(ignoredSelector));
  }

  readonly #onMove = (event: PointerEvent): void => {
    const point = this.#toNormalized(event);
    if (!this.#present) {
      this.#last.x = point.x;
      this.#last.y = point.y;
    }
    if (this.#pressed && event.pointerType === 'mouse') {
      this.drag.x += point.x - this.position.x;
      this.drag.y += point.y - this.position.y;
    }
    this.position.x = point.x;
    this.position.y = point.y;
    this.#present = true;
    this.#hovering = event.pointerType === 'mouse' && this.#isScene(event);
    if (event.pointerType === 'mouse') {
      this.#target.x = point.x;
      this.#target.y = point.y;
    }
  };

  readonly #onDown = (event: PointerEvent): void => {
    if (!this.#isScene(event)) {
      return;
    }
    const point = this.#toNormalized(event);
    this.position.x = point.x;
    this.position.y = point.y;
    this.#last.x = point.x;
    this.#last.y = point.y;
    this.#present = true;
    this.#pressed = true;
    this.#pressStart = { x: event.clientX, y: event.clientY, time: performance.now() };
  };

  readonly #onUp = (event: PointerEvent): void => {
    if (!this.#pressed) {
      return;
    }
    this.#pressed = false;
    const moved = Math.hypot(
      event.clientX - this.#pressStart.x,
      event.clientY - this.#pressStart.y,
    );
    const held = (performance.now() - this.#pressStart.time) / 1000;
    if (moved < tapDistance && held < tapSeconds) {
      this.#taps.push(this.#toNormalized(event));
    }
    if (event.pointerType !== 'mouse') {
      this.#present = false;
    }
  };

  readonly #onCancel = (): void => {
    this.#pressed = false;
  };

  readonly #onLeave = (): void => {
    this.#hovering = false;
    this.#pressed = false;
  };
}
