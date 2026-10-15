import { Vector3 } from 'three';
import type { CameraShot } from './CameraRig.ts';

type Triple = readonly [number, number, number];

export interface ShotFrame {
  readonly position: Triple;
  readonly target: Triple;
  readonly fov: number;
}

export interface ResponsiveShot {
  readonly landscape: ShotFrame;
  readonly portrait: ShotFrame;
}

const portraitAspect = 0.62;
const landscapeAspect = 1.4;

export function orientationBlend(aspect: number): number {
  const ratio = (aspect - portraitAspect) / (landscapeAspect - portraitAspect);
  return Math.min(Math.max(ratio, 0), 1);
}

export class MutableShot implements CameraShot {
  readonly position = new Vector3();
  readonly target = new Vector3();
  fov = 40;
}

const portraitPoint = new Vector3();

export function resolveShot(shot: ResponsiveShot, aspect: number, out: MutableShot): MutableShot {
  const blend = orientationBlend(aspect);
  out.position.set(...shot.landscape.position);
  out.position.lerp(portraitPoint.set(...shot.portrait.position), 1 - blend);
  out.target.set(...shot.landscape.target);
  out.target.lerp(portraitPoint.set(...shot.portrait.target), 1 - blend);
  out.fov = shot.portrait.fov + (shot.landscape.fov - shot.portrait.fov) * blend;
  return out;
}

export function blendShots(from: MutableShot, to: MutableShot, amount: number, out: MutableShot) {
  out.position.lerpVectors(from.position, to.position, amount);
  out.target.lerpVectors(from.target, to.target, amount);
  out.fov = from.fov + (to.fov - from.fov) * amount;
  return out;
}

export const heroShot: ResponsiveShot = {
  landscape: { position: [0, 1.45, 10.2], target: [-2.8, 2.3, 0], fov: 34 },
  portrait: { position: [0, 1.5, 12.5], target: [0, 0.55, 0], fov: 52 },
};
