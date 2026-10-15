import { describe, expect, it } from 'vitest';
import { scaleProgress, WeightedProgress } from '../src/client/experience/core/progress.ts';
import {
  type DeviceSignals,
  detectTier,
  FrameRateMonitor,
  lowerTier,
  parseTier,
  qualityPresets,
  qualityTiers,
} from '../src/client/experience/core/quality.ts';

const desktop: DeviceSignals = {
  coarsePointer: false,
  hardwareConcurrency: 12,
  deviceMemory: 16,
  maxTextureSize: 16384,
  saveData: false,
};

describe('quality tiers', () => {
  it('classifies typical devices', () => {
    expect(detectTier(desktop)).toBe('high');
    expect(
      detectTier({ ...desktop, coarsePointer: true, hardwareConcurrency: 8, deviceMemory: 4 }),
    ).toBe('medium');
    expect(
      detectTier({
        coarsePointer: true,
        hardwareConcurrency: 4,
        deviceMemory: 2,
        maxTextureSize: 4096,
        saveData: false,
      }),
    ).toBe('low');
    expect(detectTier({ ...desktop, saveData: true })).toBe('low');
  });

  it('steps down until the lowest tier and parses overrides', () => {
    expect(lowerTier('high')).toBe('medium');
    expect(lowerTier('medium')).toBe('low');
    expect(lowerTier('low')).toBeNull();
    expect(parseTier('medium')).toBe('medium');
    expect(parseTier('ultra')).toBeNull();
    expect(parseTier(null)).toBeNull();
  });

  it('never increases cost when lowering the tier', () => {
    for (let index = 1; index < qualityTiers.length; index += 1) {
      const lower = qualityPresets[qualityTiers[index - 1] ?? 'low'];
      const higher = qualityPresets[qualityTiers[index] ?? 'high'];
      expect(lower.maxPixelRatio).toBeLessThanOrEqual(higher.maxPixelRatio);
      expect(lower.particleScale).toBeLessThanOrEqual(higher.particleScale);
      expect(lower.reflectionScale).toBeLessThanOrEqual(higher.reflectionScale);
      expect(lower.multisampling).toBeLessThanOrEqual(higher.multisampling);
    }
  });
});

describe('frame rate monitor', () => {
  const options = { targetFps: 45, windowSeconds: 1, warmupSeconds: 0.5, stableSeconds: 2 };

  function run(monitor: FrameRateMonitor, fps: number, seconds: number) {
    const verdicts = [];
    for (let time = 0; time < seconds; time += 1 / fps) {
      verdicts.push(monitor.sample(1 / fps));
    }
    return verdicts.filter((verdict) => verdict !== null);
  }

  it('asks to degrade after a slow window and ignores the warm-up', () => {
    expect(run(new FrameRateMonitor(options), 20, 1.6)).toEqual(['degrade']);
  });

  it('reports stability after sustained smooth frames', () => {
    expect(run(new FrameRateMonitor(options), 60, 2.6)).toContain('stable');
  });
});

describe('weighted progress', () => {
  it('combines weighted stages monotonically', () => {
    const reported: number[] = [];
    const progress = new WeightedProgress({ assets: 3, compile: 1 }, (value) =>
      reported.push(value),
    );
    progress.set('assets', 0.5);
    progress.set('assets', 0.2);
    progress.set('compile', 1);
    progress.set('assets', 1);
    expect(reported).toEqual([0.375, 0.625, 1]);
  });

  it('maps progress into a sub-range', () => {
    const values: number[] = [];
    const listener = scaleProgress((value) => values.push(value), 0.2, 0.6);
    listener(0);
    listener(0.5);
    listener(1);
    expect(values).toHaveLength(3);
    expect(values[0]).toBeCloseTo(0.2);
    expect(values[1]).toBeCloseTo(0.4);
    expect(values[2]).toBeCloseTo(0.6);
  });
});
