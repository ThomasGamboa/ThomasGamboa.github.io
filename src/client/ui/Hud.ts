import { formatIndex } from '../../shared/i18n/format.ts';
import type { ChapterState, ChapterTracker } from './ChapterTracker.ts';

export class Hud {
  readonly #root: HTMLElement;
  readonly #chapter: HTMLElement | null;
  readonly #index: HTMLElement | null;
  readonly #progress: HTMLElement | null;
  readonly #clock: HTMLElement | null;
  #lastLabel: string | null = null;

  constructor(root: HTMLElement, tracker: ChapterTracker) {
    this.#root = root;
    this.#chapter = root.querySelector('[data-hud-chapter]');
    this.#index = root.querySelector('[data-hud-index]');
    this.#progress = root.querySelector('[data-hud-progress]');
    this.#clock = root.querySelector('[data-hud-clock]');
    tracker.subscribe(this.#render);
    this.#startClock();
  }

  readonly #render = ({ label, index, progress }: ChapterState): void => {
    this.#root.style.setProperty('--hud-progress', progress.toFixed(4));
    if (this.#progress) {
      this.#progress.textContent = String(Math.round(progress * 100)).padStart(3, '0');
    }
    if (label && label !== this.#lastLabel) {
      this.#lastLabel = label;
      if (this.#chapter) {
        this.#chapter.textContent = label;
      }
      if (this.#index) {
        this.#index.textContent = formatIndex(index + 1);
      }
    }
  };

  #startClock(): void {
    const clock = this.#clock;
    const timeZone = clock?.dataset.timeZone;
    if (!clock || !timeZone) {
      return;
    }
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const update = () => {
      clock.textContent = formatter.format(new Date());
    };
    update();
    window.setInterval(update, 1000);
  }
}
