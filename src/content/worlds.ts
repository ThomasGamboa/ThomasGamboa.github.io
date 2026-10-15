import { assetStorePublisher, itchProfile, voxelNestCatalog } from './catalog.ts';
import { archiveProjects } from './projects.ts';
import type { ExternalLink, World } from './types.ts';

const nightboundsBeta: ExternalLink = {
  kind: 'itch',
  href: 'https://thomasgamboa.itch.io/nightbounds-beta-combate',
  label: { es: 'Probar la beta', en: 'Try the beta' },
};

const assetStore: ExternalLink = {
  kind: 'unity',
  href: assetStorePublisher,
  label: { es: 'Unity Asset Store', en: 'Unity Asset Store' },
};

const itch: ExternalLink = {
  kind: 'itch',
  href: itchProfile,
  label: { es: 'itch.io', en: 'itch.io' },
};

const freePackages = voxelNestCatalog.filter((item) => item.price === null).length;

export const worlds: readonly World[] = [
  {
    id: 'nightbounds',
    slug: 'the-nightbounds',
    anchor: { es: 'the-nightbounds', en: 'the-nightbounds' },
    eyebrow: { es: 'Videojuego en desarrollo', en: 'Game in development' },
    title: { es: 'The Nightbounds', en: 'The Nightbounds' },
    summary: {
      es: 'Un roguelike de acción isométrico en mundo abierto, inspirado en la cultura ecuatoriana. De día exploras y te haces fuerte; de noche sobrevives a oleadas que vuelven con más ganas en cada ciclo.',
      en: 'An isometric open-world action roguelike inspired by Ecuadorian culture. By day you explore and grow stronger; by night you survive waves that come back hungrier every cycle.',
    },
    schemaType: 'VideoGame',
    page: {
      seo: {
        title: {
          es: 'The Nightbounds — Roguelike de acción isométrico inspirado en Ecuador',
          en: 'The Nightbounds — Isometric action roguelike inspired by Ecuador',
        },
        description: {
          es: 'The Nightbounds es un roguelike de acción isométrico en mundo abierto, inspirado en la cultura ecuatoriana. La beta de combate está disponible en itch.io para Windows y Android.',
          en: 'The Nightbounds is an isometric open-world action roguelike inspired by Ecuadorian culture. The combat beta is available on itch.io for Windows and Android.',
        },
      },
      action: { es: 'Ver el juego', en: 'See the game' },
    },
    highlights: [
      { value: '5', label: { es: 'Personajes', en: 'Characters' } },
      { value: '80+', label: { es: 'Mejoras', en: 'Upgrades' } },
      { value: '15', label: { es: 'Armas', en: 'Weapons' } },
    ],
    links: [nightboundsBeta],
    blocks: [
      {
        type: 'text',
        heading: { es: 'El ciclo', en: 'The cycle' },
        paragraphs: {
          es: [
            'Cada partida se parte en dos. El día es para explorar, abrir cofres, subir de nivel y armar una build. La noche es para aguantar: oleadas de enemigos que crecen con cada ciclo hasta que algo se rompe, tú o ellos.',
            'Es pixel art, con combate entre el bullet hell y el hack and slash, y corre en Windows y Android.',
          ],
          en: [
            'Every run splits in two. Daytime is for exploring, opening chests, levelling up and putting a build together. Night is for holding on: enemy waves that grow every cycle until something breaks, you or them.',
            'It is pixel art, with combat somewhere between bullet hell and hack and slash, and it runs on Windows and Android.',
          ],
        },
      },
      {
        type: 'text',
        heading: { es: 'La beta de combate', en: 'The combat beta' },
        paragraphs: {
          es: [
            'La primera beta pone a prueba solo el combate: el mundo abierto todavía no tiene misiones, personajes ni recompensas por explorar. Trae cinco personajes con armas, estadísticas y pasivas propias, más de ochenta mejoras, quince armas y un escenario generado al azar, el Valle de los Cuchillos.',
            'El objetivo es sencillo: que alguien lo rompa. Buscar sinergias, builds absurdas y los lugares donde el equilibrio no aguanta.',
          ],
          en: [
            'The first beta tests the combat and nothing else: the open world has no quests, characters or exploration rewards yet. It ships five characters with their own weapons, stats and passives, more than eighty upgrades, fifteen weapons and one randomly generated stage, the Valley of Knives.',
            'The goal is simple: get someone to break it. Find synergies, absurd builds and the places where the balance gives way.',
          ],
        },
      },
      {
        type: 'links',
        heading: { es: 'Jugar', en: 'Play' },
        items: [
          {
            ...nightboundsBeta,
            label: { es: 'The Nightbounds en itch.io', en: 'The Nightbounds on itch.io' },
          },
        ],
      },
    ],
    projectIds: [],
  },
  {
    id: 'voxelnest',
    slug: 'voxelnest',
    anchor: { es: 'voxelnest', en: 'voxelnest' },
    eyebrow: { es: 'Assets y herramientas para Unity', en: 'Unity assets and tools' },
    title: { es: 'VoxelNest', en: 'VoxelNest' },
    summary: {
      es: 'Mi estudio de assets para Unity: entornos voxel acogedores, cielos procedurales, shaders y herramientas de editor. Piezas pequeñas, modulares y listas para usar.',
      en: 'My Unity asset studio: cozy voxel environments, procedural skies, shaders and editor tools. Small, modular pieces that are ready to drop in.',
    },
    schemaType: 'CreativeWork',
    page: {
      seo: {
        title: {
          es: 'VoxelNest — Assets voxel y herramientas para Unity',
          en: 'VoxelNest — Voxel assets and tools for Unity',
        },
        description: {
          es: 'VoxelNest es el estudio de assets de Thomas Gamboa: entornos voxel, cielos procedurales, shaders y herramientas de editor para Unity, en la Unity Asset Store y en itch.io.',
          en: 'VoxelNest is Thomas Gamboa’s asset studio: voxel environments, procedural skies, shaders and editor tools for Unity, on the Unity Asset Store and itch.io.',
        },
      },
      action: { es: 'Ver el catálogo', en: 'See the catalog' },
    },
    highlights: [
      { value: String(voxelNestCatalog.length), label: { es: 'Paquetes', en: 'Packages' } },
      { value: String(freePackages), label: { es: 'Gratuitos', en: 'Free' } },
      { value: '2', label: { es: 'Tiendas', en: 'Stores' } },
    ],
    links: [assetStore, itch],
    blocks: [
      {
        type: 'text',
        heading: { es: 'La idea', en: 'The idea' },
        paragraphs: {
          es: [
            'VoxelNest hace assets voxel para juegos, dioramas y proyectos creativos. La estética es mínima y cálida: voxels limpios, colores suaves y piezas modulares que encajan entre sí.',
            'Además de modelos y texturas publico shaders y herramientas de editor: SKYVOX para cielos procedurales en URP y SOeasy para ordenar ScriptableObjects en una sola ventana.',
          ],
          en: [
            'VoxelNest makes voxel assets for games, dioramas and creative projects. The look is minimal and warm: clean voxels, soft colors and modular pieces that fit together.',
            'Beyond models and textures I publish shaders and editor tools: SKYVOX for procedural skies in URP and SOeasy for keeping ScriptableObjects in a single window.',
          ],
        },
      },
      {
        type: 'catalog',
        heading: { es: 'Catálogo', en: 'Catalog' },
        items: voxelNestCatalog,
      },
      {
        type: 'links',
        heading: { es: 'Tiendas', en: 'Stores' },
        items: [assetStore, itch],
      },
    ],
    projectIds: [],
  },
  {
    id: 'archive',
    slug: 'archive',
    anchor: { es: 'otros-proyectos', en: 'other-projects' },
    eyebrow: { es: 'Archivo', en: 'Archive' },
    title: { es: 'Otros proyectos', en: 'Other projects' },
    summary: {
      es: 'Juegos, instalaciones y aplicaciones de los últimos años. Algunos se pueden jugar; otros viven en museos o en mi disco duro.',
      en: 'Games, installations and apps from the last few years. Some you can play; others live in museums or on my hard drive.',
    },
    schemaType: 'CollectionPage',
    page: null,
    highlights: [],
    links: [],
    blocks: [],
    projectIds: archiveProjects.map((project) => project.id),
  },
];
