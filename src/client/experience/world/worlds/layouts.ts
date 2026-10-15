import type { Triple } from '../../camera/shots.ts';
import type { WorldModule } from '../WorldModule.ts';

export type { Triple };

export type WorldVisual = 'night' | 'voxel' | 'bubbles';

export interface WorldLayout {
  readonly center: Triple;
  readonly radius: number;
  readonly visual: WorldVisual;
}

export interface CelestialBody extends WorldModule {
  readonly chapterId: string;
  setPresence(value: number): void;
}

export const worldLayouts: Readonly<Record<string, WorldLayout>> = {
  nightbounds: { center: [-16, 7, -70], radius: 8, visual: 'night' },
  voxelnest: { center: [20, -2, -140], radius: 7, visual: 'voxel' },
  archive: { center: [-12, 5, -205], radius: 7, visual: 'bubbles' },
};

export const singularityCenter: Triple = [0, 2, -290];
export const singularityRadius = 3;

export function resolveWorldLayouts(chapterIds: readonly string[]): Map<string, WorldLayout> {
  const layouts = new Map<string, WorldLayout>();
  let previous: Triple = [0, 2, -20];
  let side = -1;
  for (const id of chapterIds) {
    if (id === 'hero' || id === 'about' || id === 'contact') {
      continue;
    }
    const layout = worldLayouts[id] ?? {
      center: [side * 18, previous[1], previous[2] - 65] as Triple,
      radius: 7,
      visual: 'bubbles' as const,
    };
    layouts.set(id, layout);
    previous = layout.center;
    side = -Math.sign(layout.center[0] || side);
  }
  return layouts;
}
