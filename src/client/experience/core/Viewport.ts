export interface ViewportState {
  readonly width: number;
  readonly height: number;
  readonly aspect: number;
  readonly pixelRatio: number;
}

export type ViewportListener = (state: ViewportState) => void;

export class Viewport {
  readonly #element: HTMLElement;
  #maximumPixelRatio: number;
  readonly #listeners = new Set<ViewportListener>();
  readonly #observer: ResizeObserver;
  #state: ViewportState;

  constructor(element: HTMLElement, maximumPixelRatio: number) {
    this.#element = element;
    this.#maximumPixelRatio = maximumPixelRatio;
    this.#state = this.#measure();
    this.#observer = new ResizeObserver(() => this.#update());
    this.#observer.observe(element);
  }

  get state(): ViewportState {
    return this.#state;
  }

  onChange(listener: ViewportListener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  setMaximumPixelRatio(value: number): void {
    this.#maximumPixelRatio = value;
    this.#update();
  }

  dispose(): void {
    this.#observer.disconnect();
    this.#listeners.clear();
  }

  #measure(): ViewportState {
    const width = Math.max(this.#element.clientWidth, 1);
    const height = Math.max(this.#element.clientHeight, 1);
    return {
      width,
      height,
      aspect: width / height,
      pixelRatio: Math.min(window.devicePixelRatio || 1, this.#maximumPixelRatio),
    };
  }

  #update(): void {
    const next = this.#measure();
    const previous = this.#state;
    if (
      next.width === previous.width &&
      next.height === previous.height &&
      next.pixelRatio === previous.pixelRatio
    ) {
      return;
    }
    this.#state = next;
    for (const listener of this.#listeners) {
      listener(next);
    }
  }
}
