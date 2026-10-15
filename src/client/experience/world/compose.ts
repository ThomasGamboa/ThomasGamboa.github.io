import type { PerspectiveCamera, Texture } from 'three';
import type { ViewportState } from '../core/Viewport.ts';
import type { Cast } from '../timeline/Director.ts';
import { Cube } from './cube/Cube.ts';
import { Sky } from './environment/Sky.ts';
import { Water } from './landscape/Water.ts';
import { Dust } from './particles/Dust.ts';
import { Nebula } from './particles/Nebula.ts';
import { Singularity } from './singularity/Singularity.ts';
import type { WorldModule } from './WorldModule.ts';
import {
  type CelestialBody,
  resolveWorldLayouts,
  singularityCenter,
  singularityRadius,
  type WorldLayout,
} from './worlds/layouts.ts';
import { MarbleWorld } from './worlds/MarbleWorld.ts';
import { NightWorld } from './worlds/NightWorld.ts';
import { VoxelWorld } from './worlds/VoxelWorld.ts';

export interface WorldContext {
  readonly camera: PerspectiveCamera;
  readonly viewport: ViewportState;
  readonly skyMap: Texture | null;
  readonly chapterIds: readonly string[];
  readonly scope: ParentNode;
}

export interface ComposedWorld {
  readonly cast: Cast;
  readonly modules: readonly WorldModule[];
  readonly layouts: ReadonlyMap<string, WorldLayout>;
}

function projectCount(scope: ParentNode, chapterId: string): number {
  return scope.querySelectorAll(`[data-chapter="${chapterId}"] [data-project]`).length;
}

function createBody(
  chapterId: string,
  layout: WorldLayout,
  index: number,
  scope: ParentNode,
): CelestialBody {
  const seed = 101 + index * 37;
  switch (layout.visual) {
    case 'night':
      return new NightWorld(chapterId, layout);
    case 'voxel':
      return new VoxelWorld(chapterId, layout, seed);
    case 'marbles':
      return new MarbleWorld(chapterId, layout, Math.max(projectCount(scope, chapterId), 5), seed);
  }
}

export function composeWorld(context: WorldContext): ComposedWorld {
  const layouts = resolveWorldLayouts(context.chapterIds);
  const cube = new Cube();
  const lastCenter = [...layouts.values()].at(-1)?.center[2] ?? -60;
  const cast: Cast = {
    sky: new Sky(context.camera, context.skyMap),
    water: new Water(context.viewport),
    dust: new Dust({ center: [0, 4, -6], extent: [48, 9, 46] }, 7),
    cube,
    nebula: new Nebula(
      cube.object.position.clone(),
      {
        start: -6,
        end: Math.min(lastCenter, singularityCenter[2] + 40),
        height: singularityCenter[1],
      },
      23,
    ),
    bodies: [...layouts].map(([id, layout], index) => createBody(id, layout, index, context.scope)),
    singularity: new Singularity(context.camera, singularityCenter, singularityRadius),
  };

  const modules: WorldModule[] = [
    cast.sky,
    cast.water,
    cast.dust,
    cast.nebula,
    cast.cube,
    ...cast.bodies,
    cast.singularity,
  ];
  return { cast, modules, layouts };
}
