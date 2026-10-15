import {
  Euler,
  Group,
  Matrix3,
  Matrix4,
  type Texture,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from 'three';
import type { Pointer } from '../../core/Pointer.ts';
import type { FrameState } from '../../core/Ticker.ts';
import type { WorldModule } from '../WorldModule.ts';
import { createFilmMap } from './environment-map.ts';

export interface FilmReflections {
  readonly texture: Texture;
  readonly rotation: Matrix3;
}

export class Reflections implements WorldModule, FilmReflections {
  readonly object = new Group();
  readonly rotation = new Matrix3();
  readonly #target: WebGLRenderTarget;
  readonly #pointer: Pointer;
  readonly #euler = new Euler(0, 0, 0, 'YXZ');
  readonly #matrix = new Matrix4();
  readonly #lean = { x: 0, y: 0 };
  #swirl = 0;
  #swirlVelocity = 0;

  constructor(renderer: WebGLRenderer, pointer: Pointer) {
    this.#target = createFilmMap(renderer);
    this.#pointer = pointer;
    this.object.name = 'reflections';
  }

  get texture(): Texture {
    return this.#target.texture;
  }

  update({ delta, elapsed }: FrameState): void {
    const step = Math.min(delta, 1 / 30);
    const pointer = this.#pointer;
    const targetX = pointer.present ? pointer.position.x : 0;
    const targetY = pointer.present ? pointer.position.y : 0;
    const blend = 1 - Math.exp(-step / 0.45);
    this.#lean.x += (targetX - this.#lean.x) * blend;
    this.#lean.y += (targetY - this.#lean.y) * blend;
    this.#swirlVelocity += pointer.velocity.x * 0.35 * step;
    this.#swirlVelocity *= Math.exp(-step * 2.4);
    this.#swirl += this.#swirlVelocity * step * 6;
    this.#swirl *= Math.exp(-step * 0.35);
    this.#euler.set(
      this.#lean.y * 0.45,
      elapsed * 0.035 + this.#lean.x * 0.9 + this.#swirl,
      Math.sin(elapsed * 0.11) * 0.12,
    );
    this.rotation.setFromMatrix4(this.#matrix.makeRotationFromEuler(this.#euler));
  }

  dispose(): void {
    this.#target.dispose();
  }
}
