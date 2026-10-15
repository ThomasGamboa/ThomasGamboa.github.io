import type { CameraShot } from '../camera/CameraRig.ts';
import {
  blendFrames,
  MutableFrame,
  MutableShot,
  placeShot,
  resolveFrame,
} from '../camera/shots.ts';
import type { Entity } from '../world/entity/Entity.ts';
import type { EntityForm } from '../world/entity/forms.ts';
import type { Moons } from '../world/entity/Moons.ts';
import type { Sky } from '../world/environment/Sky.ts';
import type { Water } from '../world/landscape/Water.ts';
import type { Dust } from '../world/particles/Dust.ts';
import type { Motes } from '../world/particles/Motes.ts';
import type { ScrollTimeline } from './ScrollTimeline.ts';
import { smootherstep, smoothstep } from './timeline-math.ts';

export interface Cast {
  readonly sky: Sky;
  readonly water: Water;
  readonly dust: Dust;
  readonly motes: Motes;
  readonly entity: Entity;
  readonly moons: Moons;
}

export class Director {
  readonly #timeline: ScrollTimeline;
  readonly #cast: Cast;
  readonly #forms: readonly EntityForm[];
  readonly #moonCounts: readonly number[];
  readonly #aboutIndex: number;
  readonly #from = new MutableFrame();
  readonly #to = new MutableFrame();
  readonly #frame = new MutableFrame();
  readonly #shot = new MutableShot();

  constructor(
    timeline: ScrollTimeline,
    cast: Cast,
    forms: readonly EntityForm[],
    projectCount: number,
  ) {
    this.#timeline = timeline;
    this.#cast = cast;
    this.#forms = forms;
    this.#moonCounts = forms.map((form) => (form.moons === 'projects' ? projectCount : form.moons));
    const about = timeline.indexOf('about');
    this.#aboutIndex = about >= 0 ? about : 1;
  }

  frame(aspect: number): CameraShot {
    const time = this.#timeline.time;
    const last = this.#forms.length - 1;
    const index = Math.min(Math.max(Math.floor(time), 0), Math.max(last - 1, 0));
    const local = Math.min(Math.max(time - index, 0), 1);
    const amount = smootherstep(local);
    const from = this.#forms[index];
    const to = this.#forms[index + 1] ?? from;
    if (!from || !to) {
      return this.#shot;
    }

    const { entity, moons } = this.#cast;
    entity.setMorph(from, to, amount);
    const fromMoons = this.#moonCounts[index] ?? 0;
    const toMoons = this.#moonCounts[index + 1] ?? fromMoons;
    moons.count = fromMoons + (toMoons - fromMoons) * amount;

    resolveFrame(from, aspect, this.#from);
    resolveFrame(to, aspect, this.#to);
    blendFrames(this.#from, this.#to, amount, this.#frame);
    placeShot(entity.center, this.#frame, this.#shot);

    this.#choreograph(time, entity.energy);
    return this.#shot;
  }

  #choreograph(time: number, energy: number): void {
    const about = this.#aboutIndex;
    const { sky, water, dust, motes, entity } = this.#cast;
    water.fade = 1 - smoothstep(about - 0.1, about + 0.6, time);
    dust.opacity = 1 - smoothstep(about, about + 0.45, time);
    sky.uniforms.uSpace.value = smoothstep(about + 0.05, about + 0.8, time);
    motes.setState(entity.center, smoothstep(about - 0.4, about + 0.5, time), energy);
  }
}
