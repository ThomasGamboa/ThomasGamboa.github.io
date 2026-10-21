const easingTimeConstant = 120;
const completionThreshold = 0.999;

export class LoadingScreen {
  readonly #root: HTMLElement;
  readonly #value: HTMLElement | null;
  readonly #fill: HTMLElement | null;
  readonly #reducedMotion: boolean;
  #target = 0;
  #displayed = 0;
  #frame = 0;
  #lastTime = 0;
  #resolveCompletion: (() => void) | null = null;

  static attach(scope: ParentNode): LoadingScreen | null {
    const root = scope.querySelector<HTMLElement>('[data-loader]');
    return root ? new LoadingScreen(root) : null;
  }

  constructor(root: HTMLElement) {
    this.#root = root;
    this.#value = root.querySelector<HTMLElement>('[data-loader-value]');
    this.#fill = root.querySelector<HTMLElement>('[data-loader-fill]');
    this.#reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.#root.dataset.state = 'loading';
  }

  setProgress(progress: number): void {
    this.#target = Math.max(this.#target, Math.min(Math.max(progress, 0), 1));
    if (this.#reducedMotion) {
      this.#render(this.#target);
      this.#settle();
      return;
    }
    if (this.#frame === 0) {
      this.#lastTime = performance.now();
      this.#frame = requestAnimationFrame(this.#tick);
    }
  }

  complete(): Promise<void> {
    return new Promise((resolve) => {
      this.#resolveCompletion = resolve;
      this.setProgress(1);
    });
  }

  readonly #tick = (time: number): void => {
    const delta = time - this.#lastTime;
    this.#lastTime = time;
    const blend = 1 - Math.exp(-delta / easingTimeConstant);
    this.#render(this.#displayed + (this.#target - this.#displayed) * blend);

    if (this.#target - this.#displayed < 0.002) {
      this.#render(this.#target);
      this.#frame = 0;
      this.#settle();
      return;
    }
    this.#frame = requestAnimationFrame(this.#tick);
  };

  #render(progress: number): void {
    this.#displayed = progress;
    const percentage = Math.round(progress * 100);
    this.#root.style.setProperty('--loader-progress', progress.toFixed(4));
    if (this.#value) {
      this.#value.textContent = String(percentage).padStart(3, '0');
    }
    if (this.#fill) {
      this.#fill.style.transform = `scaleX(${progress.toFixed(4)})`;
    }
  }

  #settle(): void {
    if (this.#displayed < completionThreshold || !this.#resolveCompletion) {
      return;
    }
    const resolve = this.#resolveCompletion;
    this.#resolveCompletion = null;
    this.#root.dataset.state = 'complete';
    resolve();

    const finish = () => {
      this.#root.hidden = true;
    };
    if (this.#reducedMotion) {
      finish();
      return;
    }
    this.#root.addEventListener('transitionend', finish, { once: true });
    window.setTimeout(finish, 1200);
  }
}
