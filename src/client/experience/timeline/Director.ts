import type { CameraShot } from '../camera/CameraRig.ts';
import {
  aboutShot,
  blendShots,
  diveShot,
  heroShot,
  MutableShot,
  orbitShot,
  type ResponsiveShot,
  resolveShot,
  singularityShot,
} from '../camera/shots.ts';
import type { Cube } from '../world/cube/Cube.ts';
import type { Sky } from '../world/environment/Sky.ts';
import type { Water } from '../world/landscape/Water.ts';
import type { Dust } from '../world/particles/Dust.ts';
import type { Nebula } from '../world/particles/Nebula.ts';
import type { Singularity } from '../world/singularity/Singularity.ts';
import type { CelestialBody, WorldLayout } from '../world/worlds/layouts.ts';
import type { ScrollTimeline } from './ScrollTimeline.ts';
import { band, smootherstep, smoothstep } from './timeline-math.ts';

export interface Cast {
  readonly sky: Sky;
  readonly water: Water;
  readonly dust: Dust;
  readonly cube: Cube;
  readonly nebula: Nebula;
  readonly bodies: readonly CelestialBody[];
  readonly singularity: Singularity;
}

export class Director {
  readonly #timeline: ScrollTimeline;
  readonly #cast: Cast;
  readonly #shots: readonly ResponsiveShot[];
  readonly #aboutIndex: number;
  readonly #contactIndex: number;
  readonly #bodyIndices: readonly number[];
  readonly #from = new MutableShot();
  readonly #to = new MutableShot();
  readonly #current = new MutableShot();

  constructor(timeline: ScrollTimeline, cast: Cast, layouts: ReadonlyMap<string, WorldLayout>) {
    this.#timeline = timeline;
    this.#cast = cast;
    const center = cast.singularity.center.toArray();
    const radius = cast.singularity.radius;

    const shots = timeline.chapterIds.map((id): ResponsiveShot => {
      if (id === 'about') {
        return aboutShot;
      }
      if (id === 'contact') {
        return singularityShot(center, radius);
      }
      const layout = layouts.get(id);
      return layout ? orbitShot(layout.center, layout.radius) : heroShot;
    });
    this.#shots = [...(shots.length > 0 ? shots : [heroShot]), diveShot(center, radius)];

    const about = timeline.indexOf('about');
    const contact = timeline.indexOf('contact');
    this.#aboutIndex = about >= 0 ? about : 1;
    this.#contactIndex = contact >= 0 ? contact : this.#shots.length - 2;
    this.#bodyIndices = cast.bodies.map((body) => timeline.indexOf(body.chapterId));
  }

  frame(aspect: number): CameraShot {
    const time = this.#timeline.time;
    const last = this.#shots.length - 1;
    const index = Math.min(Math.max(Math.floor(time), 0), last - 1);
    const local = Math.min(Math.max(time - index, 0), 1);
    const fromShot = this.#shots[index] ?? heroShot;
    const toShot = this.#shots[index + 1] ?? fromShot;
    resolveShot(fromShot, aspect, this.#from);
    resolveShot(toShot, aspect, this.#to);
    blendShots(this.#from, this.#to, smootherstep(local), this.#current);

    this.#choreograph(time);
    return this.#current;
  }

  #choreograph(time: number): void {
    const about = this.#aboutIndex;
    const { sky, water, dust, cube, nebula, bodies, singularity } = this.#cast;

    cube.open = smoothstep(about - 0.6, about, time);
    cube.dissolve = smoothstep(about + 0.12, about + 0.6, time);
    water.fade = 1 - smoothstep(about - 0.25, about + 0.2, time);
    dust.opacity = 1 - smoothstep(about, about + 0.45, time);
    sky.uniforms.uSpace.value = smoothstep(about + 0.05, about + 0.8, time);
    nebula.setPresence(
      smoothstep(about + 0.1, about + 1.05, time),
      smoothstep(about + 0.05, about + 0.35, time),
    );

    bodies.forEach((body, bodyIndex) => {
      const chapter = this.#bodyIndices[bodyIndex] ?? -10;
      body.setPresence(band(time, chapter, 0.35, 0.95));
    });
    singularity.setPresence(smoothstep(this.#contactIndex - 1.4, this.#contactIndex - 0.35, time));
  }
}
