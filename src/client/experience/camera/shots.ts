import { Vector3 } from 'three';
import type { CameraShot } from './CameraRig.ts';

export type Triple = readonly [number, number, number];

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

export const aboutShot: ResponsiveShot = {
  landscape: { position: [0.3, 2.5, 2.5], target: [-1.35, 2.3, 0], fov: 48 },
  portrait: { position: [0, 2.7, 2.6], target: [0, 1.6, 0], fov: 64 },
};

function offset(center: Triple, radius: number, x: number, y: number, z: number): Triple {
  return [center[0] + x * radius, center[1] + y * radius, center[2] + z * radius];
}

export function orbitShot(center: Triple, radius: number): ResponsiveShot {
  return {
    landscape: {
      position: offset(center, radius, -0.75, 0.25, 4.6),
      target: offset(center, radius, -1, 0, 0),
      fov: 36,
    },
    portrait: {
      position: offset(center, radius, 0, 0.4, 6.2),
      target: offset(center, radius, 0, -0.95, 0),
      fov: 54,
    },
  };
}

export function singularityShot(center: Triple, radius: number): ResponsiveShot {
  return {
    landscape: {
      position: offset(center, radius, -1.4, 0.75, 7.6),
      target: offset(center, radius, -2.2, 0, 0),
      fov: 40,
    },
    portrait: {
      position: offset(center, radius, 0, 1.1, 12),
      target: offset(center, radius, 0, -1.9, 0),
      fov: 58,
    },
  };
}

export function diveShot(center: Triple, radius: number): ResponsiveShot {
  return {
    landscape: {
      position: offset(center, radius, -0.12, 0.2, 3.1),
      target: offset(center, radius, -0.25, 0, 0),
      fov: 52,
    },
    portrait: {
      position: offset(center, radius, 0, 0.3, 4.4),
      target: offset(center, radius, 0, -0.35, 0),
      fov: 66,
    },
  };
}
