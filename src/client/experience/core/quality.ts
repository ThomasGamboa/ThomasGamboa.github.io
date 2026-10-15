export type QualityTier = 'low' | 'medium' | 'high';

export const qualityTiers: readonly QualityTier[] = ['low', 'medium', 'high'];

export interface QualitySettings {
  readonly tier: QualityTier;
  readonly maxPixelRatio: number;
  readonly multisampling: number;
  readonly bloomLevels: number;
  readonly reflectionScale: number;
  readonly transmission: boolean;
  readonly particleScale: number;
}

export const qualityPresets: Readonly<Record<QualityTier, QualitySettings>> = {
  high: {
    tier: 'high',
    maxPixelRatio: 2,
    multisampling: 4,
    bloomLevels: 8,
    reflectionScale: 0.5,
    transmission: true,
    particleScale: 1,
  },
  medium: {
    tier: 'medium',
    maxPixelRatio: 1.5,
    multisampling: 0,
    bloomLevels: 6,
    reflectionScale: 0.35,
    transmission: true,
    particleScale: 0.6,
  },
  low: {
    tier: 'low',
    maxPixelRatio: 1,
    multisampling: 0,
    bloomLevels: 5,
    reflectionScale: 0,
    transmission: false,
    particleScale: 0.3,
  },
};

export interface DeviceSignals {
  readonly coarsePointer: boolean;
  readonly hardwareConcurrency: number;
  readonly deviceMemory: number | null;
  readonly maxTextureSize: number;
  readonly saveData: boolean;
}

export function detectTier(signals: DeviceSignals): QualityTier {
  if (signals.saveData) {
    return 'low';
  }
  let score = signals.coarsePointer ? 0 : 2;
  if (signals.hardwareConcurrency >= 8) {
    score += 2;
  } else if (signals.hardwareConcurrency >= 4) {
    score += 1;
  }
  if (signals.deviceMemory === null || signals.deviceMemory >= 8) {
    score += 1;
  } else if (signals.deviceMemory <= 2) {
    score -= 2;
  }
  if (signals.maxTextureSize >= 16384) {
    score += 1;
  } else if (signals.maxTextureSize < 8192) {
    score -= 1;
  }
  if (score >= 5) {
    return 'high';
  }
  return score >= 2 ? 'medium' : 'low';
}

export function lowerTier(tier: QualityTier): QualityTier | null {
  const index = qualityTiers.indexOf(tier);
  return index > 0 ? (qualityTiers[index - 1] ?? null) : null;
}

export function parseTier(value: string | null): QualityTier | null {
  return qualityTiers.find((tier) => tier === value) ?? null;
}

export interface FrameRateMonitorOptions {
  readonly targetFps: number;
  readonly windowSeconds: number;
  readonly warmupSeconds: number;
  readonly stableSeconds: number;
}

export type FrameRateVerdict = 'degrade' | 'stable' | null;

export class FrameRateMonitor {
  readonly #options: FrameRateMonitorOptions;
  #warmup = 0;
  #windowTime = 0;
  #windowFrames = 0;
  #stableTime = 0;

  constructor(options: FrameRateMonitorOptions) {
    this.#options = options;
  }

  reset(): void {
    this.#warmup = 0;
    this.#windowTime = 0;
    this.#windowFrames = 0;
    this.#stableTime = 0;
  }

  sample(delta: number): FrameRateVerdict {
    if (this.#warmup < this.#options.warmupSeconds) {
      this.#warmup += delta;
      return null;
    }
    this.#windowTime += delta;
    this.#windowFrames += 1;
    if (this.#windowTime < this.#options.windowSeconds) {
      return null;
    }
    const fps = this.#windowFrames / this.#windowTime;
    const elapsed = this.#windowTime;
    this.#windowTime = 0;
    this.#windowFrames = 0;
    if (fps < this.#options.targetFps) {
      this.#stableTime = 0;
      return 'degrade';
    }
    this.#stableTime += elapsed;
    return this.#stableTime >= this.#options.stableSeconds ? 'stable' : null;
  }
}
