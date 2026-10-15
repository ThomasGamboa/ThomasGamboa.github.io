import { Vector3 } from 'three';
import type { CameraShot } from './CameraRig.ts';

export type Triple = readonly [number, number, number];

export interface OrbitFrame {
  readonly distance: number;
  readonly azimuth: number;
  readonly elevation: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly fov: number;
}

export interface ResponsiveFrame {
  readonly landscape: OrbitFrame;
  readonly portrait: OrbitFrame;
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

export class MutableFrame implements OrbitFrame {
  distance = 10;
  azimuth = 0;
  elevation = 0;
  offsetX = 0;
  offsetY = 0;
  fov = 40;
}

const keys = ['distance', 'azimuth', 'elevation', 'offsetX', 'offsetY', 'fov'] as const;

export function blendFrames(
  from: OrbitFrame,
  to: OrbitFrame,
  amount: number,
  out: MutableFrame,
): MutableFrame {
  for (const key of keys) {
    out[key] = from[key] + (to[key] - from[key]) * amount;
  }
  return out;
}

export function resolveFrame(
  frame: ResponsiveFrame,
  aspect: number,
  out: MutableFrame,
): MutableFrame {
  return blendFrames(frame.portrait, frame.landscape, orientationBlend(aspect), out);
}

const right = new Vector3();

export function placeShot(center: Vector3, frame: OrbitFrame, out: MutableShot): MutableShot {
  const { distance, azimuth, elevation } = frame;
  out.position.set(
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
    Math.cos(azimuth) * Math.cos(elevation),
  );
  out.position.multiplyScalar(distance).add(center);
  right.set(Math.cos(azimuth), 0, -Math.sin(azimuth));
  out.target.copy(center).addScaledVector(right, -frame.offsetX);
  out.target.y += frame.offsetY;
  out.fov = frame.fov;
  return out;
}
