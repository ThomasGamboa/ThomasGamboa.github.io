import { archiveProjects } from './projects.ts';
import type { World } from './types.ts';

export const worlds: readonly World[] = [
  {
    id: 'nightbounds',
    slug: 'the-nightbounds',
    anchor: { es: 'the-nightbounds', en: 'the-nightbounds' },
    eyebrow: { es: 'Videojuego en desarrollo', en: 'Game in development' },
    title: { es: 'The Nightbounds', en: 'The Nightbounds' },
    summary: {
      es: 'Un roguelike de mundo abierto inspirado en la cultura ecuatoriana, actualmente en desarrollo.',
      en: 'An open-world roguelike inspired by Ecuadorian culture, currently in development.',
    },
    schemaType: 'VideoGame',
    page: {
      seo: {
        title: {
          es: 'The Nightbounds — Roguelike de mundo abierto inspirado en Ecuador',
          en: 'The Nightbounds — Open-world roguelike inspired by Ecuador',
        },
        description: {
          es: 'The Nightbounds es un roguelike de mundo abierto inspirado en la cultura ecuatoriana, desarrollado por Thomas Gamboa.',
          en: 'The Nightbounds is an open-world roguelike inspired by Ecuadorian culture, developed by Thomas Gamboa.',
        },
      },
    },
    blocks: [],
    projectIds: [],
  },
  {
    id: 'voxelnest',
    slug: 'voxelnest',
    anchor: { es: 'voxelnest', en: 'voxelnest' },
    eyebrow: { es: 'Assets para videojuegos', en: 'Game assets' },
    title: { es: 'VoxelNest', en: 'VoxelNest' },
    summary: {
      es: 'Desarrollo y creación de assets para videojuegos en Unity, distribuidos a través de itch.io.',
      en: 'Game assets designed and built for Unity, distributed through itch.io.',
    },
    schemaType: 'CreativeWork',
    page: {
      seo: {
        title: {
          es: 'VoxelNest — Assets para videojuegos en Unity',
          en: 'VoxelNest — Game assets for Unity',
        },
        description: {
          es: 'VoxelNest es el proyecto de Thomas Gamboa dedicado a crear assets para videojuegos en Unity, disponibles en itch.io.',
          en: 'VoxelNest is Thomas Gamboa’s project dedicated to creating game assets for Unity, available on itch.io.',
        },
      },
    },
    blocks: [],
    projectIds: [],
  },
  {
    id: 'archive',
    slug: 'archive',
    anchor: { es: 'otros-proyectos', en: 'other-projects' },
    eyebrow: { es: 'Archivo', en: 'Archive' },
    title: { es: 'Otros proyectos', en: 'Other projects' },
    summary: {
      es: 'Una selección de experiencias interactivas, aplicaciones y videojuegos desarrollados anteriormente.',
      en: 'A selection of interactive experiences, apps and games developed earlier.',
    },
    schemaType: 'CollectionPage',
    page: null,
    blocks: [],
    projectIds: archiveProjects.map((project) => project.id),
  },
];
