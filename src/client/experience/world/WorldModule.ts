import type { Object3D } from 'three';
import type { QualitySettings } from '../core/quality.ts';
import type { FrameState } from '../core/Ticker.ts';

export interface WorldModule {
  readonly object: Object3D;
  update(frame: FrameState): void;
  applyQuality?(quality: QualitySettings): void;
  dispose(): void;
}
