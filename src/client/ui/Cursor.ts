const followTimeConstant = 55;
const settleDistance = 0.3;
const interactiveSelector = 'a, button, summary, label, input, select, textarea, [role="button"]';

export class Cursor {
  readonly #root: HTMLElement;
  readonly #label: HTMLElement;
  #targetX = 0;
  #targetY = 0;
  #x = 0;
  #y = 0;
  #frame = 0;
  #lastTime = 0;
  #placed = false;

  static mount(host: HTMLElement): Cursor | null {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return finePointer && !reducedMotion ? new Cursor(host) : null;
  }

  constructor(host: HTMLElement) {
    this.#root = document.createElement('div');
    this.#root.className = 'cursor';
    this.#root.setAttribute('aria-hidden', 'true');
    this.#root.innerHTML =
      '<span class="cursor__reticle"></span><span class="cursor__dot"></span><span class="cursor__label"></span>';
    this.#label = this.#root.querySelector('.cursor__label') as HTMLElement;
    host.append(this.#root);

    window.addEventListener('pointermove', this.#onMove, { passive: true });
    document.addEventListener('pointerover', this.#onOver);
    window.addEventListener('pointerdown', () => this.#toggle('pressed', true));
    window.addEventListener('pointerup', () => this.#toggle('pressed', false));
    document.documentElement.addEventListener('pointerleave', () => this.#toggle('visible', false));
    document.documentElement.addEventListener('pointerenter', () =>
      this.#toggle('visible', this.#placed),
    );
  }

  #toggle(state: 'visible' | 'hover' | 'pressed', enabled: boolean): void {
    this.#root.toggleAttribute(`data-${state}`, enabled);
  }

  readonly #onMove = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') {
      return;
    }
    this.#targetX = event.clientX;
    this.#targetY = event.clientY;
    if (!this.#placed) {
      this.#placed = true;
      this.#x = this.#targetX;
      this.#y = this.#targetY;
      this.#place();
      this.#toggle('visible', true);
    }
    if (this.#frame === 0) {
      this.#lastTime = performance.now();
      this.#frame = requestAnimationFrame(this.#follow);
    }
  };

  readonly #onOver = (event: PointerEvent): void => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const labelled = event.target.closest<HTMLElement>('[data-cursor]');
    const interactive = event.target.closest(interactiveSelector);
    const label = labelled?.dataset.cursor ?? '';
    this.#label.textContent = label;
    this.#root.toggleAttribute('data-label', label !== '');
    this.#toggle('hover', interactive !== null && label === '');
  };

  readonly #follow = (time: number): void => {
    const blend = 1 - Math.exp(-(time - this.#lastTime) / followTimeConstant);
    this.#lastTime = time;
    this.#x += (this.#targetX - this.#x) * blend;
    this.#y += (this.#targetY - this.#y) * blend;
    this.#place();

    const distance = Math.abs(this.#targetX - this.#x) + Math.abs(this.#targetY - this.#y);
    this.#frame = distance > settleDistance ? requestAnimationFrame(this.#follow) : 0;
  };

  #place(): void {
    this.#root.style.transform = `translate3d(${this.#x.toFixed(1)}px, ${this.#y.toFixed(1)}px, 0)`;
  }
}
