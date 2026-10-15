export function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function smootherstep(value: number): number {
  const t = clamp01(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function band(value: number, center: number, inner: number, outer: number): number {
  const distance = Math.abs(value - center);
  return 1 - smoothstep(inner, outer, distance);
}

export interface TimelineLayout {
  readonly chapterTops: readonly number[];
  readonly viewportHeight: number;
  readonly maxScroll: number;
}

export function timelineTime(scroll: number, layout: TimelineLayout): number {
  const { chapterTops, viewportHeight, maxScroll } = layout;
  const count = chapterTops.length;
  if (count === 0) {
    return 0;
  }
  for (let index = 0; index < count - 1; index += 1) {
    const nextTop = chapterTops[index + 1] ?? 0;
    if (scroll < nextTop) {
      const travelStart = Math.max(nextTop - viewportHeight, chapterTops[index] ?? 0);
      const travel = Math.max(nextTop - travelStart, 1);
      return index + clamp01((scroll - travelStart) / travel);
    }
  }
  const lastTop = chapterTops[count - 1] ?? 0;
  const tail = Math.max(maxScroll - lastTop, 1);
  return count - 1 + clamp01((scroll - lastTop) / tail);
}
