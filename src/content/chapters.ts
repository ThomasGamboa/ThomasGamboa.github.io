import type { Chapter } from './types.ts';
import { worlds } from './worlds.ts';

export const chapters: readonly Chapter[] = [
  {
    id: 'hero',
    anchor: { es: 'inicio', en: 'start' },
    label: { es: 'Inicio', en: 'Start' },
  },
  {
    id: 'about',
    anchor: { es: 'sobre-mi', en: 'about' },
    label: { es: 'Sobre mí', en: 'About' },
  },
  ...worlds.map((world): Chapter => ({ id: world.id, anchor: world.anchor, label: world.title })),
  {
    id: 'contact',
    anchor: { es: 'contacto', en: 'contact' },
    label: { es: 'Contacto', en: 'Contact' },
  },
];

export function findChapter(id: Chapter['id']): Chapter {
  const chapter = chapters.find((candidate) => candidate.id === id);
  if (!chapter) {
    throw new Error(`Unknown chapter "${id}"`);
  }
  return chapter;
}
