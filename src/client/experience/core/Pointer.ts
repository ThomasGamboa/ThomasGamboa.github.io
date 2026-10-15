const easingSeconds = 0.6;

export class Pointer {
  readonly smoothed = { x: 0, y: 0 };
  readonly #target = { x: 0, y: 0 };

  constructor() {
    window.addEventListener('pointermove', this.#onMove, { passive: true });
  }

  update(delta: number): void {
    const blend = 1 - Math.exp(-delta / easingSeconds);
    this.smoothed.x += (this.#target.x - this.smoothed.x) * blend;
    this.smoothed.y += (this.#target.y - this.smoothed.y) * blend;
  }

  dispose(): void {
    window.removeEventListener('pointermove', this.#onMove);
  }

  readonly #onMove = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') {
      return;
    }
    this.#target.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.#target.y = -((event.clientY / window.innerHeight) * 2 - 1);
  };
}
