export type ProgressListener = (progress: number) => void;

export class WeightedProgress<Key extends string> {
  readonly #weights: ReadonlyMap<Key, number>;
  readonly #values = new Map<Key, number>();
  readonly #listener: ProgressListener;
  readonly #total: number;
  #reported = 0;

  constructor(weights: Readonly<Record<Key, number>>, listener: ProgressListener) {
    this.#weights = new Map(Object.entries(weights) as [Key, number][]);
    this.#total = [...this.#weights.values()].reduce((sum, weight) => sum + weight, 0);
    this.#listener = listener;
  }

  get value(): number {
    if (this.#total <= 0) {
      return 1;
    }
    let sum = 0;
    for (const [key, weight] of this.#weights) {
      sum += (this.#values.get(key) ?? 0) * weight;
    }
    return sum / this.#total;
  }

  set(key: Key, progress: number): void {
    this.#values.set(key, Math.min(Math.max(progress, this.#values.get(key) ?? 0), 1));
    const value = this.value;
    if (value > this.#reported) {
      this.#reported = value;
      this.#listener(value);
    }
  }
}

export function scaleProgress(
  listener: ProgressListener,
  from: number,
  to: number,
): ProgressListener {
  return (progress) => listener(from + (to - from) * progress);
}
