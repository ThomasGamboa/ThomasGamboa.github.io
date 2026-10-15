import { assetStorePublisher, itchProfile, voxelNestCatalog } from './catalog.ts';
import { archiveProjects } from './projects.ts';
import type { ExternalLink, MediaReference, World } from './types.ts';

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

function nightboundsShot(index: number, es: string, en: string): MediaReference {
  return {
    src: `worlds/nightbounds/${String(index).padStart(2, '0')}.webp`,
    alt: { es, en },
  };
}

const nightboundsKeyArt = nightboundsShot(
  1,
  'The Nightbounds: el logo sobre un caballero con una espada gigante en una colina de noche',
  'The Nightbounds: the logo above a knight with a giant sword on a hill at night',
);

const freePackages = voxelNestCatalog.filter((item) => item.price === null).length;

export const worlds: readonly World[] = [
  {
    id: 'nightbounds',
    slug: 'the-nightbounds',
    anchor: { es: 'the-nightbounds', en: 'the-nightbounds' },
    eyebrow: { es: 'Videojuego en desarrollo', en: 'Game in development' },
    title: { es: 'The Nightbounds', en: 'The Nightbounds' },
    summary: {
      es: 'Roguelike de acción isométrico de mundo abierto, inspirado en la cultura ecuatoriana. De día exploras y subes de nivel; de noche sobrevives a oleadas de enemigos.',
      en: 'Isometric open-world action roguelike inspired by Ecuadorian culture. By day you explore and level up; by night you survive waves of enemies.',
    },
    schemaType: 'VideoGame',
    cover: nightboundsKeyArt,
    game: {
      genres: ['Roguelike', 'Action', 'Role-playing'],
      platforms: ['Windows', 'Android'],
    },
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
        type: 'video',
        heading: { es: 'Teaser de la beta', en: 'Beta teaser' },
        provider: 'file',
        id: '/media/video/the-nightbounds-teaser-beta.mp4',
        title: { es: 'Teaser de la beta de The Nightbounds', en: 'The Nightbounds beta teaser' },
        poster: nightboundsKeyArt,
        duration: 'PT1M19S',
        uploadDate: '2026-10-07T20:16:00Z',
      },
      {
        type: 'text',
        heading: { es: 'El ciclo', en: 'The cycle' },
        paragraphs: {
          es: [
            'Cada partida tiene dos fases. De día exploras, abres cofres, subes de nivel y armas tu build. De noche resistes oleadas de enemigos que se vuelven más difíciles en cada ciclo.',
            'Pixel art y combate entre bullet hell y hack and slash. Para Windows y Android.',
          ],
          en: [
            'Each run has two phases. By day you explore, open chests, level up and put a build together. By night you hold off enemy waves that get harder every cycle.',
            'Pixel art, with combat between bullet hell and hack and slash. For Windows and Android.',
          ],
        },
      },
      {
        type: 'gallery',
        heading: { es: 'Capturas', en: 'Screenshots' },
        items: [
          nightboundsShot(
            2,
            'Un caballero con espada en el borde de una isla de pasto rodeada de agua',
            'A knight with a sword at the edge of a grassy island surrounded by water',
          ),
          nightboundsShot(
            3,
            'Una horda de esqueletos rodea al personaje en un campo de flores durante la noche',
            'A horde of skeletons surrounds the player in a field of flowers at night',
          ),
          nightboundsShot(
            4,
            'Un arco de luz amarilla atraviesa a los enemigos junto a un altar de piedra',
            'An arc of yellow light cuts through enemies next to a stone altar',
          ),
          nightboundsShot(
            5,
            'Relámpagos azules encadenan a varios enemigos bajo la lluvia',
            'Blue lightning chains between several enemies in the rain',
          ),
          nightboundsShot(
            6,
            'Combate contra una horda bajo una luz roja, con proyectiles brillantes',
            'Fighting a horde under red light, with glowing projectiles',
          ),
          nightboundsShot(
            7,
            'Aviso de evolución de clase: «Ahora eres el Ancestro Chamánico III»',
            'Class evolution notice: “You are now the Shamanic Ancestor III”',
          ),
          nightboundsShot(
            8,
            'Pantalla para elegir una mejora entre Sed vampírica, Sanguinario arcano y Corte amplio',
            'Upgrade screen offering Vampiric Thirst, Arcane Bloodthirst and Wide Cut',
          ),
          nightboundsShot(
            9,
            'Un altar de piedra con un cristal brillante en medio del pasto',
            'A stone shrine with a glowing crystal in the middle of the grass',
          ),
          nightboundsShot(
            10,
            'Sprite en pixel art de una personaje con gorro rojo y poncho de colores',
            'Pixel art sprite of a character in a red hat and a colorful poncho',
          ),
        ],
      },
      {
        type: 'text',
        heading: { es: 'La beta de combate', en: 'The combat beta' },
        paragraphs: {
          es: [
            'La primera beta prueba solo el combate; el mundo abierto todavía no tiene misiones ni personajes. Incluye cinco personajes con armas, estadísticas y pasivas propias, más de ochenta mejoras, quince armas y un escenario generado al azar: el Valle de los Cuchillos.',
            'Sirve para encontrar sinergias, builds rotas y problemas de balance.',
          ],
          en: [
            'The first beta tests only the combat; the open world has no quests or characters yet. It includes five characters with their own weapons, stats and passives, more than eighty upgrades, fifteen weapons and one randomly generated stage: the Valley of Knives.',
            'Its purpose is to find synergies, broken builds and balance problems.',
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
      es: 'Mi estudio de assets para Unity: entornos voxel, cielos procedurales, shaders y herramientas de editor.',
      en: 'My Unity asset studio: voxel environments, procedural skies, shaders and editor tools.',
    },
    schemaType: 'CreativeWork',
    cover: null,
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
        heading: { es: 'Qué hace', en: 'What it does' },
        paragraphs: {
          es: [
            'Assets voxel para juegos y dioramas en Unity: modelos modulares, texturas, cielos y shaders.',
            'También publica herramientas de editor: SKYVOX para cielos procedurales en URP y SOeasy para gestionar ScriptableObjects.',
          ],
          en: [
            'Voxel assets for Unity games and dioramas: modular models, textures, skies and shaders.',
            'It also publishes editor tools: SKYVOX for procedural skies in URP and SOeasy for managing ScriptableObjects.',
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
      es: 'Juegos, instalaciones y aplicaciones anteriores.',
      en: 'Earlier games, installations and apps.',
    },
    schemaType: 'CollectionPage',
    cover: null,
    page: null,
    highlights: [],
    links: [],
    blocks: [],
    projectIds: archiveProjects.map((project) => project.id),
  },
];
