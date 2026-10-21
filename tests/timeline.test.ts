import { describe, expect, it } from 'vitest';
import { Intro } from '../src/client/experience/timeline/Intro.ts';
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

function runIntro(intro: Intro, seconds: number, rush = false): void {
  for (let elapsed = 0; elapsed < seconds; elapsed += 1 / 60) {
    intro.update(1 / 60, rush);
  }
}

describe('intro', () => {
  it('stays neutral until it is armed', () => {
    const intro = new Intro();
    expect(intro.active).toBe(false);
    expect(intro.assemble).toBe(1);
    expect(intro.light).toBe(1);
    intro.arm();
    expect(intro.active).toBe(true);
    expect(intro.assemble).toBe(0);
    expect(intro.emblem).toBe(0);
    expect(intro.dock).toBe(0);
  });

  it('fires impact, reveal and completion in order and settles neutral', () => {
    const intro = new Intro();
    const events: string[] = [];
    intro.arm();
    intro.play({
      onImpact: () => events.push('impact'),
      onReveal: () => events.push('reveal'),
      onComplete: () => events.push('complete'),
    });
    runIntro(intro, intro.impactTime - 0.1);
    expect(events).toEqual([]);
    runIntro(intro, 0.3);
    expect(events).toEqual(['impact', 'reveal']);
    runIntro(intro, 2);
    expect(events).toEqual(['impact', 'reveal', 'complete']);
    expect(intro.active).toBe(false);
    expect(intro.assemble).toBe(1);
    expect(intro.turn).toBe(0);
    expect(intro.dock).toBe(1);
  });

  it('finishes faster when the visitor scrolls away', () => {
    const intro = new Intro();
    let complete = false;
    intro.arm();
    intro.play({ onComplete: () => (complete = true) });
    runIntro(intro, 1, true);
    expect(complete).toBe(true);
  });

  it('returns to neutral without firing handlers when cancelled', () => {
    const intro = new Intro();
    const events: string[] = [];
    intro.arm();
    intro.play({ onComplete: () => events.push('complete') });
    runIntro(intro, 0.5);
    intro.cancel();
    expect(intro.active).toBe(false);
    expect(intro.assemble).toBe(1);
    expect(events).toEqual([]);
  });

  it('reveals immediately when it was never armed', () => {
    const intro = new Intro();
    const events: string[] = [];
    intro.play({
      onImpact: () => events.push('impact'),
      onReveal: () => events.push('reveal'),
      onComplete: () => events.push('complete'),
    });
    expect(events).toEqual(['reveal', 'complete']);
  });
});
