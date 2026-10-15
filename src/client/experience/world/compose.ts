import type { PerspectiveCamera, Texture, WebGLRenderer } from 'three';
import type { Pointer } from '../core/Pointer.ts';
import type { ViewportState } from '../core/Viewport.ts';
import type { Cast } from '../timeline/Director.ts';
import { Entity } from './entity/Entity.ts';
import { FluidField } from './entity/FluidField.ts';
import { type EntityForm, resolveForms } from './entity/forms.ts';
import { Moons } from './entity/Moons.ts';
import { Reflections } from './environment/Reflections.ts';
import { Sky } from './environment/Sky.ts';
import { Water } from './landscape/Water.ts';
import { Dust } from './particles/Dust.ts';
import { Motes } from './particles/Motes.ts';
import type { WorldModule } from './WorldModule.ts';

export interface WorldContext {
  readonly renderer: WebGLRenderer;
  readonly camera: PerspectiveCamera;
  readonly pointer: Pointer;
  readonly viewport: ViewportState;
  readonly skyMap: Texture | null;
  readonly chapterIds: readonly string[];
  readonly scope: ParentNode;
}

export interface ComposedWorld {
  readonly cast: Cast;
  readonly modules: readonly WorldModule[];
  readonly forms: readonly EntityForm[];
  readonly projectCount: number;
  readonly fluid: FluidField;
}

export const entityCenter = [0, 2.3, 0] as const;

const maxMoons = 6;

export function composeWorld(context: WorldContext): ComposedWorld {
  const { renderer, camera, pointer } = context;
  const forms = resolveForms(context.chapterIds);
  const projectCount = Math.min(context.scope.querySelectorAll('[data-project]').length, maxMoons);
  const capacity = Math.max(
    ...forms.map((form) => (form.moons === 'projects' ? projectCount : form.moons)),
    0,
  );
  const fluid = new FluidField(renderer);
  const reflections = new Reflections(renderer, pointer);
  const entity = new Entity(
    camera,
    pointer,
    fluid,
    entityCenter,
    forms[0]?.palette ?? ['#fff', '#fff', '#fff', '#fff', '#fff'],
    reflections,
  );
  const cast: Cast = {
    sky: new Sky(camera, context.skyMap),
    water: new Water(context.viewport),
    dust: new Dust({ center: [0, 4, -6], extent: [48, 9, 46] }, 7),
    motes: new Motes(camera, pointer, 23),
    entity,
    moons: new Moons(entity, camera, pointer, fluid, capacity, 41, reflections),
  };
  const modules: WorldModule[] = [
    reflections,
    cast.sky,
    cast.water,
    cast.dust,
    cast.motes,
    cast.entity,
    cast.moons,
  ];
  return { cast, modules, forms, projectCount, fluid };
}
