import { type PerspectiveCamera, Vector3 } from 'three';
import type { Pointer } from '../core/Pointer.ts';
import type { FrameState } from '../core/Ticker.ts';

export interface CameraShot {
  readonly position: Vector3;
  readonly target: Vector3;
  readonly fov: number;
}

const followSeconds = 0.18;
const parallax = { x: 0.32, y: 0.16 };
const right = new Vector3();
const up = new Vector3();

export class CameraRig {
  readonly #camera: PerspectiveCamera;
  readonly #pointer: Pointer;
  readonly #desiredPosition = new Vector3();
  readonly #desiredTarget = new Vector3();
  readonly #position = new Vector3();
  readonly #target = new Vector3();
  #desiredFov: number;
  #fov: number;
  #placed = false;
  #parallaxStrength = 1;

  constructor(camera: PerspectiveCamera, pointer: Pointer) {
    this.#camera = camera;
    this.#pointer = pointer;
    this.#desiredFov = camera.fov;
    this.#fov = camera.fov;
  }

  set parallaxStrength(value: number) {
    this.#parallaxStrength = value;
  }

  setShot(shot: CameraShot): void {
    this.#desiredPosition.copy(shot.position);
    this.#desiredTarget.copy(shot.target);
    this.#desiredFov = shot.fov;
    if (!this.#placed) {
      this.#placed = true;
      this.#position.copy(shot.position);
      this.#target.copy(shot.target);
      this.#fov = shot.fov;
    }
  }

  snap(): void {
    this.#position.copy(this.#desiredPosition);
    this.#target.copy(this.#desiredTarget);
    this.#fov = this.#desiredFov;
  }

  update({ delta, elapsed }: FrameState): void {
    const blend = 1 - Math.exp(-delta / followSeconds);
    this.#position.lerp(this.#desiredPosition, blend);
    this.#target.lerp(this.#desiredTarget, blend);
    this.#fov += (this.#desiredFov - this.#fov) * blend;

    const idleX = Math.sin(elapsed * 0.13) * 0.12;
    const idleY = Math.sin(elapsed * 0.19) * 0.06;
    const offsetX = (this.#pointer.smoothed.x * parallax.x + idleX) * this.#parallaxStrength;
    const offsetY = (this.#pointer.smoothed.y * parallax.y + idleY) * this.#parallaxStrength;

    this.#camera.position.copy(this.#position);
    this.#camera.lookAt(this.#target);
    this.#camera.updateMatrixWorld();
    right.setFromMatrixColumn(this.#camera.matrixWorld, 0);
    up.setFromMatrixColumn(this.#camera.matrixWorld, 1);
    this.#camera.position.addScaledVector(right, offsetX).addScaledVector(up, offsetY);
    this.#camera.lookAt(this.#target);

    if (Math.abs(this.#camera.fov - this.#fov) > 0.01) {
      this.#camera.fov = this.#fov;
      this.#camera.updateProjectionMatrix();
    }
  }
}
