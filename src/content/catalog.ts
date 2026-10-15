import type { CatalogItem, ExternalLink } from './types.ts';

export const assetStorePublisher = 'https://assetstore.unity.com/publishers/113832';
export const itchProfile = 'https://thomasgamboa.itch.io/';

function assetStore(id: number): ExternalLink {
  return {
    kind: 'unity',
    href: `https://assetstore.unity.com/packages/package/${id}`,
    label: { es: 'Asset Store', en: 'Asset Store' },
  };
}

function itch(slug: string): ExternalLink {
  return {
    kind: 'itch',
    href: `https://thomasgamboa.itch.io/${slug}`,
    label: { es: 'itch.io', en: 'itch.io' },
  };
}

function usd(amount: number) {
  return { amount, currency: 'USD' } as const;
}

const tool = { es: 'Herramienta de editor', en: 'Editor tool' };
const environment = { es: 'Entorno 3D', en: '3D environment' };
const props = { es: 'Modelos 3D', en: '3D models' };
const sky = { es: 'Cielo', en: 'Sky' };
const shader = { es: 'Shader', en: 'Shader' };

export const voxelNestCatalog: readonly CatalogItem[] = [
  {
    id: 'skyvox',
    title: 'SKYVOX',
    category: sky,
    summary: {
      es: 'Cielo voxel procedural para URP con nubes volumétricas, ciclo de día y noche, estrellas y perfiles intercambiables.',
      en: 'Procedural voxel sky for URP with volumetric clouds, a day and night cycle, stars and swappable profiles.',
    },
    price: usd(19.98),
    links: [
      assetStore(389908),
      itch('skyvox-stylized-volumetric-procedural-voxel-sky-system-for-urp'),
    ],
  },
  {
    id: 'soeasy-pro',
    title: 'SOeasy PRO',
    category: tool,
    summary: {
      es: 'Ventana para buscar, ordenar y editar ScriptableObjects, con fijados, espacios de trabajo y búsqueda de referencias.',
      en: 'Window to find, sort and edit ScriptableObjects, with pinning, workspaces and reference search.',
    },
    price: usd(9),
    links: [assetStore(400742), itch('soeasy-pro-centralized-scriptable-objects-manager')],
  },
  {
    id: 'soeasy',
    title: 'SOeasy',
    category: tool,
    summary: {
      es: 'Versión base: agrupa los ScriptableObjects del proyecto por carpeta.',
      en: 'Base version: groups the project’s ScriptableObjects by folder.',
    },
    price: null,
    links: [assetStore(401966), itch('soeasy-centralized-scriptable-objects-manager')],
  },
  {
    id: 'cozy-nature',
    title: 'Cozy Nature',
    category: environment,
    summary: {
      es: '71 piezas modulares de naturaleza voxel, optimizadas para juego.',
      en: '71 modular voxel nature pieces, optimized for games.',
    },
    price: usd(24.99),
    links: [
      assetStore(316885),
      itch('cozy-nature-full-voxel-style-modular-enviorement-asset-pack-and-textures'),
    ],
  },
  {
    id: 'cozy-nature-free',
    title: 'Cozy Nature FREE',
    category: environment,
    summary: {
      es: '20 modelos del pack de naturaleza.',
      en: '20 models from the nature pack.',
    },
    price: null,
    links: [
      assetStore(316893),
      itch('cozy-nature-free-voxel-style-modular-enviorement-asset-pack-and-textures'),
    ],
  },
  {
    id: 'fantasy-weapons',
    title: 'Fantasy Weapons & Tools',
    category: props,
    summary: {
      es: '57 armas y herramientas voxel con progresión en cuatro niveles y variantes elementales.',
      en: '57 voxel weapons and tools with a four-tier progression and elemental variants.',
    },
    price: usd(15.99),
    links: [
      assetStore(389542),
      itch('fantasy-weapons-tools-pack-full-voxel-style-medieval-tiered-collection'),
    ],
  },
  {
    id: 'fantasy-weapons-free',
    title: 'Fantasy Weapons & Tools FREE',
    category: props,
    summary: {
      es: '11 modelos del pack completo.',
      en: '11 models from the full pack.',
    },
    price: null,
    links: [
      assetStore(389550),
      itch('fantasy-weapons-tools-pack-free-voxel-style-medieval-tiered-collection'),
    ],
  },
  {
    id: 'pixel-water',
    title: 'Pixel Art Water Shader',
    category: shader,
    summary: {
      es: 'Agua pixel art para URP con espuma, reflejos y olas.',
      en: 'Pixel art water for URP with foam, reflections and waves.',
    },
    price: usd(12.95),
    links: [
      assetStore(322865),
      itch('pixel-art-water-shader-stylized-water-with-foam-reflections-and-waves-urp'),
    ],
  },
  {
    id: 'cozy-kitchen',
    title: 'Cozy Kitchen',
    category: environment,
    summary: {
      es: 'Más de 25 modelos de cocina voxel.',
      en: 'More than 25 voxel kitchen models.',
    },
    price: usd(7),
    links: [assetStore(313398), itch('cozy-kitchen-voxel-style-modular-enviorement-asset-pack')],
  },
  {
    id: 'cozy-skybox',
    title: 'Cozy Voxel Skybox',
    category: sky,
    summary: {
      es: '15 skyboxes voxel con degradados, nubes y estrellas.',
      en: '15 voxel skyboxes with gradients, clouds and stars.',
    },
    price: usd(5),
    links: [assetStore(314204), itch('cozy-voxel-skybox-full-voxel-style-textures')],
  },
  {
    id: 'cozy-skybox-free',
    title: 'Cozy Voxel Skybox FREE',
    category: sky,
    summary: {
      es: 'Cinco skyboxes del pack completo.',
      en: 'Five skyboxes from the full pack.',
    },
    price: null,
    links: [assetStore(314210), itch('cozy-voxel-skybox-free-voxel-style-textures')],
  },
];
