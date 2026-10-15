import { type TimelineLayout, timelineTime } from './timeline-math.ts';

const dampingSeconds = 0.32;

export class ScrollTimeline {
  readonly chapterIds: readonly string[];
  readonly #sections: readonly HTMLElement[];
  readonly #observer: ResizeObserver;
  readonly #reducedMotion: boolean;
  #layout: TimelineLayout = { chapterTops: [], viewportHeight: 1, maxScroll: 0 };
  #target = 0;
  #time = 0;
  #placed = false;

  constructor(scope: ParentNode) {
    this.#sections = [...scope.querySelectorAll<HTMLElement>('[data-chapter]')];
    this.chapterIds = this.#sections.map((section) => section.dataset.chapter ?? '');
    this.#reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.#observer = new ResizeObserver(() => this.#measure());
    this.#observer.observe(document.body);
    window.addEventListener('scroll', this.sync, { passive: true });
    void document.fonts?.ready.then(() => this.#measure());
    this.#measure();
  }

  get time(): number {
    return this.#time;
  }

  get target(): number {
    return this.#target;
  }

  indexOf(chapterId: string): number {
    return this.chapterIds.indexOf(chapterId);
  }

  update(delta: number): void {
    if (this.#reducedMotion || !this.#placed) {
      this.#time = this.#target;
      this.#placed = true;
      return;
    }
    const blend = 1 - Math.exp(-delta / dampingSeconds);
    this.#time += (this.#target - this.#time) * blend;
    if (Math.abs(this.#target - this.#time) < 0.0001) {
      this.#time = this.#target;
    }
  }

  hold(time: number): void {
    this.#target = time;
    this.#time = time;
    this.#placed = true;
  }

  release(): void {
    this.sync();
    this.#time = this.#target;
  }

  dispose(): void {
    this.#observer.disconnect();
    window.removeEventListener('scroll', this.sync);
  }

  readonly sync = (): void => {
    this.#target = timelineTime(window.scrollY, this.#layout);
  };

  #measure(): void {
    const scroll = window.scrollY;
    const padding = Number.parseFloat(
      getComputedStyle(document.documentElement).scrollPaddingTop || '0',
    );
    const offset = Number.isFinite(padding) ? padding : 0;
    this.#layout = {
      chapterTops: this.#sections.map((section, index) =>
        index === 0 ? 0 : section.getBoundingClientRect().top + scroll - offset,
      ),
      viewportHeight: window.innerHeight,
      maxScroll: Math.max(document.documentElement.scrollHeight - window.innerHeight, 0),
    };
    this.sync();
  }
}
