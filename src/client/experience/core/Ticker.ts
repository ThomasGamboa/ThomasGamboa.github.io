export interface FrameState {
  readonly delta: number;
  readonly elapsed: number;
  readonly frame: number;
}

export type FrameListener = (state: FrameState) => void;

const maximumDelta = 1 / 20;

export class Ticker {
  readonly #listeners = new Set<FrameListener>();
  #handle = 0;
  #lastTime = 0;
  #elapsed = 0;
  #frame = 0;
  #running = false;

  add(listener: FrameListener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  start(): void {
    if (this.#running) {
      return;
    }
    this.#running = true;
    document.addEventListener('visibilitychange', this.#onVisibilityChange);
    this.#resume();
  }

  stop(): void {
    this.#running = false;
    document.removeEventListener('visibilitychange', this.#onVisibilityChange);
    cancelAnimationFrame(this.#handle);
    this.#handle = 0;
  }

  #resume(): void {
    if (!this.#running || this.#handle !== 0 || document.hidden) {
      return;
    }
    this.#lastTime = performance.now();
    this.#handle = requestAnimationFrame(this.#tick);
  }

  readonly #onVisibilityChange = (): void => {
    if (document.hidden) {
      cancelAnimationFrame(this.#handle);
      this.#handle = 0;
      return;
    }
    this.#resume();
  };

  readonly #tick = (time: number): void => {
    const delta = Math.min((time - this.#lastTime) / 1000, maximumDelta);
    this.#lastTime = time;
    this.#elapsed += delta;
    this.#frame += 1;

    const state: FrameState = { delta, elapsed: this.#elapsed, frame: this.#frame };
    for (const listener of this.#listeners) {
      listener(state);
    }
    this.#handle = requestAnimationFrame(this.#tick);
  };
}
