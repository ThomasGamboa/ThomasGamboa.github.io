import type { Chapter } from './types.ts';
import { worlds } from './worlds.ts';

export const chapters: readonly Chapter[] = [
  { id: 'hero', anchor: { es: 'inicio', en: 'start' } },
  { id: 'about', anchor: { es: 'sobre-mi', en: 'about' } },
  ...worlds.map((world): Chapter => ({ id: world.id, anchor: world.anchor })),
  { id: 'contact', anchor: { es: 'contacto', en: 'contact' } },
];

export function chapterAnchor(id: Chapter['id']): Chapter['anchor'] {
  const chapter = chapters.find((candidate) => candidate.id === id);
  if (!chapter) {
    throw new Error(`Unknown chapter "${id}"`);
  }
  return chapter.anchor;
}
