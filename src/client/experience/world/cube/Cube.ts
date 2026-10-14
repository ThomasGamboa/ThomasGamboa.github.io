import { BoxGeometry, EdgesGeometry, LineBasicMaterial, LineSegments } from 'three';
import { palette } from '../../../../shared/design/palette.ts';
import type { FrameState } from '../../core/Ticker.ts';
import type { WorldModule } from '../WorldModule.ts';

export class Cube implements WorldModule {
  readonly object: LineSegments<EdgesGeometry, LineBasicMaterial>;

  constructor() {
    const box = new BoxGeometry(1, 1, 1);
    const edges = new EdgesGeometry(box);
    box.dispose();
    this.object = new LineSegments(edges, new LineBasicMaterial({ color: palette.signal }));
    this.object.name = 'cube';
  }

  update({ elapsed }: FrameState): void {
    this.object.rotation.set(elapsed * 0.11, elapsed * 0.17, 0);
    this.object.position.y = Math.sin(elapsed * 0.8) * 0.06;
  }

  dispose(): void {
    this.object.geometry.dispose();
    this.object.material.dispose();
  }
}
