import type { Object3D } from 'three';
import type { QualitySettings } from '../core/quality.ts';
import type { FrameState } from '../core/Ticker.ts';
import type { ViewportState } from '../core/Viewport.ts';

export interface WorldModule {
  readonly object: Object3D;
  update(frame: FrameState): void;
  applyQuality?(quality: QualitySettings): void;
  resize?(viewport: ViewportState): void;
  dispose(): void;
}
