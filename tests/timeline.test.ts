import { describe, expect, it } from 'vitest';
import {
  band,
  smootherstep,
  smoothstep,
  timelineTime,
} from '../src/client/experience/timeline/timeline-math.ts';

const layout = {
  chapterTops: [0, 800, 2400, 3200],
  viewportHeight: 800,
  maxScroll: 3600,
};

describe('timeline time', () => {
  it('travels across the hero while the next chapter rises', () => {
    expect(timelineTime(0, layout)).toBe(0);
    expect(timelineTime(400, layout)).toBe(0.5);
    expect(timelineTime(800, layout)).toBe(1);
  });

  it('holds on long chapters until the next one enters the viewport', () => {
    expect(timelineTime(1200, layout)).toBe(1);
    expect(timelineTime(1600, layout)).toBe(1);
    expect(timelineTime(2000, layout)).toBe(1.5);
    expect(timelineTime(2400, layout)).toBe(2);
  });

  it('maps the tail of the last chapter to the final unit', () => {
    expect(timelineTime(3200, layout)).toBe(3);
    expect(timelineTime(3400, layout)).toBe(3.5);
    expect(timelineTime(9999, layout)).toBe(4);
  });

  it('is monotonic over the whole scroll range', () => {
    let previous = -1;
    for (let scroll = 0; scroll <= layout.maxScroll; scroll += 25) {
      const value = timelineTime(scroll, layout);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });

  it('handles pages without chapters', () => {
    expect(timelineTime(500, { chapterTops: [], viewportHeight: 800, maxScroll: 0 })).toBe(0);
  });
});

describe('easing helpers', () => {
  it('clamps and eases between edges', () => {
    expect(smoothstep(0, 1, -1)).toBe(0);
    expect(smoothstep(0, 1, 0.5)).toBe(0.5);
    expect(smoothstep(0, 1, 2)).toBe(1);
    expect(smootherstep(0.5)).toBe(0.5);
  });

  it('builds symmetric bands around a center', () => {
    expect(band(2, 2, 0.2, 1)).toBe(1);
    expect(band(3.5, 2, 0.2, 1)).toBe(0);
    expect(band(1.4, 2, 0.2, 1)).toBeCloseTo(band(2.6, 2, 0.2, 1));
  });
});
