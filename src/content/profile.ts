import type { Localized, LocalizedText } from '../shared/i18n/locales.ts';

export interface PathEntry {
  readonly period: string;
  readonly title: LocalizedText;
  readonly place: LocalizedText;
  readonly body: LocalizedText;
}

const usfq = { es: 'Universidad San Francisco de Quito', en: 'Universidad San Francisco de Quito' };

export const profile = {
  name: 'Thomas Gamboa',
  role: {
    es: 'Diseñador interactivo y artista de nuevos medios',
    en: 'Interactive designer and new media artist',
  } satisfies LocalizedText,
  location: {
    locality: 'Quito',
    countryCode: 'EC',
    label: { es: 'Quito, Ecuador', en: 'Quito, Ecuador' } satisfies LocalizedText,
    latitude: -0.1807,
    longitude: -78.4678,
    timeZone: 'America/Guayaquil',
    utcOffsetLabel: 'UTC−5',
  },
  summary: {
    es: 'Diseñador interactivo y artista de nuevos medios en Quito, Ecuador. Desarrollo videojuegos, instalaciones interactivas, realidad virtual, sitios web 3D y assets para Unity.',
    en: 'Interactive designer and new media artist in Quito, Ecuador. I build video games, interactive installations, virtual reality, 3D websites and Unity assets.',
  } satisfies LocalizedText,
  about: {
    heading: { es: 'Sobre mí', en: 'About' } satisfies LocalizedText,
    paragraphs: {
      es: [
        'Soy Thomas Gamboa, diseñador interactivo en Quito, Ecuador. Desarrollo videojuegos, instalaciones interactivas, experiencias de realidad virtual y sitios web 3D.',
        'Estudié Medios Interactivos en la Universidad San Francisco de Quito, con una subespecialización en Arte y Tecnología. Trabajo sobre todo con Unity, Three.js, TouchDesigner y Arduino.',
        'Ahora desarrollo The Nightbounds, un roguelike de acción, y publico assets y herramientas para Unity con VoxelNest.',
      ],
      en: [
        'I’m Thomas Gamboa, an interactive designer in Quito, Ecuador. I build video games, interactive installations, virtual reality experiences and 3D websites.',
        'I studied Interactive Media at Universidad San Francisco de Quito, with a minor in Art and Technology. I work mainly with Unity, Three.js, TouchDesigner and Arduino.',
        'I’m currently developing The Nightbounds, an action roguelike, and publishing Unity assets and tools through VoxelNest.',
      ],
    } satisfies Localized<readonly string[]>,
  },
  path: {
    heading: { es: 'Trayectoria', en: 'Track record' } satisfies LocalizedText,
    entries: [
      {
        period: '2019 — 2024',
        title: { es: 'Licenciatura en Medios Interactivos', en: 'BA in Interactive Media' },
        place: usfq,
        body: {
          es: 'Subespecialización en Arte y Tecnología.',
          en: 'Minor in Art and Technology.',
        },
      },
      {
        period: '2024',
        title: {
          es: 'Premio COCOA y premio Proyectos IT Universidades',
          en: 'COCOA Award and IT University Projects award',
        },
        place: { es: 'Apangora · con Carla Torres', en: 'Apangora · with Carla Torres' },
        body: {
          es: 'Ganadores de ambos premios con Apangora, expuesta en el Museo del Agua Yaku.',
          en: 'Both awards for Apangora, exhibited at the Yaku Water Museum.',
        },
      },
      {
        period: '2023 — 2024',
        title: { es: 'La moneda en Ecuador', en: 'La moneda en Ecuador' },
        place: { es: 'Banco Central del Ecuador · Cuenca', en: 'Central Bank of Ecuador · Cuenca' },
        body: {
          es: 'Aplicación para tablet sobre la historia de la moneda ecuatoriana, con monedas en 3D.',
          en: 'Tablet app on the history of Ecuadorian currency, with coins in 3D.',
        },
      },
      {
        period: '2021 — 2024',
        title: { es: 'Qgalería', en: 'Qgalería' },
        place: usfq,
        body: {
          es: 'Más de diez galerías virtuales para web, realidad virtual y realidad aumentada.',
          en: 'More than ten virtual galleries for the web, VR and AR.',
        },
      },
      {
        period: '2021 — 2022',
        title: { es: 'I SEA YOU', en: 'I SEA YOU' },
        place: {
          es: 'Internationale Filmschule Köln · a distancia',
          en: 'Internationale Filmschule Köln · remote',
        },
        body: {
          es: 'Desarrollo de la experiencia de realidad virtual del proyecto de maestría de Alexandra Tamayo.',
          en: 'Development of the virtual reality experience for Alexandra Tamayo’s master’s project.',
        },
      },
      {
        period: '2021 — 2022',
        title: { es: 'DIM Web', en: 'DIM Web' },
        place: { es: 'USFQ · Medios Interactivos', en: 'USFQ · Interactive Media' },
        body: {
          es: 'Diseño, animación y programación del sitio de la carrera, hecho como videojuego 2D.',
          en: 'Design, animation and programming of the program’s website, built as a 2D video game.',
        },
      },
    ] satisfies readonly PathEntry[],
  },
  tools: [
    'Unity',
    'C#',
    'Three.js',
    'WebGL',
    'TouchDesigner',
    'Arduino',
    'Kinect',
    'Ionic',
    'Angular',
    'Firebase',
    'Figma',
    'After Effects',
  ],
  expertise: {
    es: [
      'Diseño interactivo',
      'Arte de nuevos medios',
      'Desarrollo web 3D',
      'Desarrollo de videojuegos',
      'Realidad virtual',
      'Instalaciones interactivas',
      'Unity',
      'Three.js',
      'WebGL',
      'TouchDesigner',
    ],
    en: [
      'Interaction design',
      'New media art',
      '3D web development',
      'Game development',
      'Virtual reality',
      'Interactive installations',
      'Unity',
      'Three.js',
      'WebGL',
      'TouchDesigner',
    ],
  } satisfies Localized<readonly string[]>,
} as const;
