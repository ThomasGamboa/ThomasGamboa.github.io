import type { ResponsiveFrame } from '../../camera/shots.ts';
import type { Palette } from './entity-material.ts';

export const entityShapes = ['sphere', 'cube', 'knot', 'voxel', 'ring'] as const;
export type EntityShape = (typeof entityShapes)[number];

export interface EntityForm extends ResponsiveFrame {
  readonly shape: EntityShape;
  readonly palette: Palette;
  readonly scale: number;
  readonly wobble: number;
  readonly glass: number;
  readonly glow: number;
  readonly rim: number;
  readonly bands: number;
  readonly spin: number;
  readonly metalness: number;
  readonly roughness: number;
  readonly iridescence: number;
  readonly reflection: number;
  readonly film: number;
  readonly chrome: number;
  readonly relief: number;
  readonly moons: number | 'projects';
}

export const palettes = {
  pearl: ['#ffffff', '#ffd6f5', '#d6fbff', '#f3ffd6', '#e6d6ff'],
  bloom: ['#ff5ec4', '#7a5cff', '#00e0ff', '#f6ff7a', '#16052f'],
  venom: ['#040108', '#ff1f4b', '#22000d', '#19e3ff', '#0a020e'],
  lime: ['#c6ff00', '#ff1fd2', '#00ffd0', '#120238', '#7a1cff'],
  acid: ['#ff2e88', '#ffd166', '#b6ff5c', '#6d28ff', '#14063d'],
  tide: ['#ff3fa4', '#5b2bff', '#f9ff6b', '#ff8a3d', '#12021f'],
  halo: ['#ff4fd8', '#2ee6ff', '#c8ff4a', '#8a4dff', '#ffb04a'],
} as const satisfies Record<string, Palette>;

export const moonPalettes: readonly Palette[] = [
  palettes.tide,
  palettes.bloom,
  palettes.lime,
  palettes.halo,
  palettes.acid,
];

const glassForm: EntityForm = {
  shape: 'cube',
  palette: palettes.pearl,
  scale: 0.92,
  wobble: 0,
  glass: 1,
  glow: 0,
  rim: 0.15,
  bands: 1.2,
  spin: 0.14,
  metalness: 0,
  roughness: 0.04,
  iridescence: 0,
  reflection: 1.25,
  film: 0.35,
  chrome: 0,
  relief: 0,
  moons: 0,
  landscape: { distance: 10.25, azimuth: 0, elevation: -0.083, offsetX: 0, offsetY: 0, fov: 34 },
  portrait: { distance: 12.5, azimuth: 0, elevation: -0.064, offsetX: 0, offsetY: 0, fov: 52 },
};

const dropForm: EntityForm = {
  shape: 'sphere',
  palette: palettes.bloom,
  scale: 0.95,
  wobble: 0.08,
  glass: 0,
  glow: 0.12,
  rim: 0.35,
  bands: 2,
  spin: 0.1,
  metalness: 0.86,
  roughness: 0.11,
  iridescence: 0.7,
  reflection: 1.6,
  film: 1,
  chrome: 0.7,
  relief: 0.11,
  moons: 1,
  landscape: { distance: 5.2, azimuth: -0.55, elevation: 0.1, offsetX: 0, offsetY: 0, fov: 42 },
  portrait: { distance: 7, azimuth: -0.35, elevation: 0.12, offsetX: 0, offsetY: 0, fov: 60 },
};

const knotForm: EntityForm = {
  shape: 'knot',
  palette: palettes.venom,
  scale: 1.55,
  wobble: 0.035,
  glass: 0,
  glow: 0.16,
  rim: 0.45,
  bands: 1.8,
  spin: 0.12,
  metalness: 0,
  roughness: 0.3,
  iridescence: 0,
  reflection: 1.25,
  film: 0,
  chrome: 0,
  relief: 0,
  moons: 2,
  landscape: { distance: 7.6, azimuth: 0.75, elevation: 0.22, offsetX: 0, offsetY: 0, fov: 38 },
  portrait: { distance: 9.6, azimuth: 0.75, elevation: 0.25, offsetX: 0, offsetY: 0, fov: 56 },
};

const voxelForm: EntityForm = {
  shape: 'voxel',
  palette: palettes.lime,
  scale: 1.3,
  wobble: 0,
  glass: 0,
  glow: 0.16,
  rim: 0.3,
  bands: 2.2,
  spin: 0.08,
  metalness: 0.84,
  roughness: 0.12,
  iridescence: 0.7,
  reflection: 1.6,
  film: 1,
  chrome: 0.55,
  relief: 0.09,
  moons: 3,
  landscape: { distance: 7.2, azimuth: 1.65, elevation: -0.1, offsetX: 0, offsetY: 0, fov: 38 },
  portrait: { distance: 9.2, azimuth: 1.65, elevation: -0.05, offsetX: 0, offsetY: 0, fov: 56 },
};

const planetForm: EntityForm = {
  shape: 'sphere',
  palette: palettes.acid,
  scale: 1.45,
  wobble: 0.02,
  glass: 0,
  glow: 0.14,
  rim: 0.5,
  bands: 2.1,
  spin: 0.05,
  metalness: 0.84,
  roughness: 0.11,
  iridescence: 0.8,
  reflection: 1.6,
  film: 1,
  chrome: 0.65,
  relief: 0.11,
  moons: 'projects',
  landscape: { distance: 10, azimuth: 2.45, elevation: 0.28, offsetX: 0, offsetY: 0, fov: 40 },
  portrait: { distance: 12.5, azimuth: 2.45, elevation: 0.3, offsetX: 0, offsetY: 0, fov: 58 },
};

const haloForm: EntityForm = {
  shape: 'ring',
  palette: palettes.halo,
  scale: 1.6,
  wobble: 0.025,
  glass: 0,
  glow: 0.32,
  rim: 0.6,
  bands: 1.1,
  spin: 0.18,
  metalness: 0.86,
  roughness: 0.1,
  iridescence: 0.9,
  reflection: 1.7,
  film: 1,
  chrome: 0.6,
  relief: 0.07,
  moons: 0,
  landscape: { distance: 7.4, azimuth: 3.2, elevation: 0.42, offsetX: 0, offsetY: 0, fov: 40 },
  portrait: { distance: 10, azimuth: 3.2, elevation: 0.42, offsetX: 0, offsetY: 0, fov: 58 },
};

export const entityForms: Readonly<Record<string, EntityForm>> = {
  hero: glassForm,
  about: dropForm,
  nightbounds: knotForm,
  voxelnest: voxelForm,
  archive: planetForm,
  contact: haloForm,
};

const fallbackPalettes: readonly Palette[] = [palettes.acid, palettes.tide, palettes.bloom];

export function fallbackForm(index: number): EntityForm {
  return {
    ...planetForm,
    moons: 2,
    palette: fallbackPalettes[index % fallbackPalettes.length] ?? palettes.acid,
  };
}

export function diveForm(form: EntityForm): EntityForm {
  return {
    ...form,
    landscape: { ...form.landscape, distance: form.landscape.distance * 0.45 },
    portrait: { ...form.portrait, distance: form.portrait.distance * 0.5 },
  };
}

export function resolveForms(chapterIds: readonly string[]): EntityForm[] {
  const forms = chapterIds.map((id, index) => entityForms[id] ?? fallbackForm(index));
  const last = forms.at(-1) ?? glassForm;
  return [...(forms.length > 0 ? forms : [glassForm]), diveForm(last)];
}

export function shapeIndex(shape: EntityShape): number {
  return entityShapes.indexOf(shape);
}
