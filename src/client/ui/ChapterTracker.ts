export interface ChapterState {
  readonly id: string | null;
  readonly label: string | null;
  readonly index: number;
  readonly progress: number;
}

export type ChapterListener = (state: ChapterState) => void;

export class ChapterTracker {
  readonly #sections: readonly HTMLElement[];
  readonly #listeners = new Set<ChapterListener>();
  #activeIndex = 0;
  #progress = 0;
  #frame = 0;

  constructor(scope: ParentNode) {
    this.#sections = [...scope.querySelectorAll<HTMLElement>('[data-chapter]')];
    if (this.#sections.length > 0) {
      const observer = new IntersectionObserver(this.#onIntersect, {
        rootMargin: '-50% 0px -50% 0px',
      });
      for (const section of this.#sections) {
        observer.observe(section);
      }
    }
    window.addEventListener('scroll', this.#scheduleMeasure, { passive: true });
    window.addEventListener('resize', this.#scheduleMeasure, { passive: true });
    this.#measure();
  }

  get state(): ChapterState {
    const section = this.#sections[this.#activeIndex];
    return {
      id: section?.dataset.chapter ?? null,
      label: section?.dataset.chapterLabel ?? null,
      index: this.#activeIndex,
      progress: this.#progress,
    };
  }

  subscribe(listener: ChapterListener): () => void {
    this.#listeners.add(listener);
    listener(this.state);
    return () => this.#listeners.delete(listener);
  }

  readonly #onIntersect = (entries: IntersectionObserverEntry[]): void => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.#activeIndex = this.#sections.indexOf(entry.target as HTMLElement);
      }
    }
    this.#emit();
  };

  readonly #scheduleMeasure = (): void => {
    if (this.#frame === 0) {
      this.#frame = requestAnimationFrame(this.#measure);
    }
  };

  readonly #measure = (): void => {
    this.#frame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    this.#progress = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
    this.#emit();
  };

  #emit(): void {
    const state = this.state;
    for (const listener of this.#listeners) {
      listener(state);
    }
  }
}
