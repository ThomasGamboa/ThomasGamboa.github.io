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
    es: 'Diseñador interactivo y artista de nuevos medios en Quito, Ecuador. Hago videojuegos, instalaciones, experiencias web 3D y assets para Unity.',
    en: 'Interactive designer and new media artist in Quito, Ecuador. I make video games, installations, 3D web experiences and Unity assets.',
  } satisfies LocalizedText,
  about: {
    heading: { es: 'Sobre mí', en: 'About' } satisfies LocalizedText,
    paragraphs: {
      es: [
        'Soy Thomas Gamboa, diseñador interactivo en Quito. Hago cosas que se recorren más de lo que se miran: videojuegos, instalaciones, galerías virtuales y sitios web que se comportan como lugares.',
        'Estudié Medios Interactivos en la Universidad San Francisco de Quito, con una subespecialización en Arte y Tecnología. Desde entonces me muevo entre Unity, Three.js, TouchDesigner y Arduino; casi siempre en ese orden, a veces todo a la vez.',
        'Lo que más me interesa es el momento en que una pieza responde: un sensor que nota que alguien se acerca, un Kinect que te deja recorrer un manglar con el cuerpo, una moneda de 1535 que giras con un dedo. Ahora mismo construyo The Nightbounds y publico herramientas para Unity como VoxelNest.',
      ],
      en: [
        'I’m Thomas Gamboa, an interactive designer in Quito. I make things you move through more than you look at: video games, installations, virtual galleries and websites that behave like places.',
        'I studied Interactive Media at Universidad San Francisco de Quito, with a minor in Art and Technology. Since then I’ve been moving between Unity, Three.js, TouchDesigner and Arduino; usually in that order, sometimes all at once.',
        'What I care about most is the moment a piece answers back: a sensor that notices someone getting close, a Kinect that lets you wander a mangrove with your body, a coin from 1535 you turn with one finger. Right now I’m building The Nightbounds and publishing Unity tools as VoxelNest.',
      ],
    } satisfies Localized<readonly string[]>,
  },
  path: {
    heading: { es: 'Trayectoria', en: 'Track record' } satisfies LocalizedText,
    entries: [
      {
        period: '2023 — 2024',
        title: { es: 'La moneda en Ecuador', en: 'La moneda en Ecuador' },
        place: { es: 'Banco Central del Ecuador · Cuenca', en: 'Central Bank of Ecuador · Cuenca' },
        body: {
          es: 'Una línea del tiempo para tablet sobre la historia de la moneda ecuatoriana, con sus piezas más importantes en 3D.',
          en: 'A tablet timeline of Ecuadorian currency, with its most important coins in 3D.',
        },
      },
      {
        period: '2023',
        title: { es: 'Luciérnagas / Mariposas', en: 'Luciérnagas / Mariposas' },
        place: {
          es: 'Centro Cultural Metropolitano · Quito',
          en: 'Metropolitan Cultural Center · Quito',
        },
        body: {
          es: 'Instalación con el artista Christian Proaño: unas gafas de realidad virtual enlazadas a un circuito que detecta a quien se acerca y cambia el entorno en tiempo real.',
          en: 'An installation with artist Christian Proaño: a VR headset linked wirelessly to a circuit that senses whoever walks up and reshapes the world in real time.',
        },
      },
      {
        period: '2021 — 2024',
        title: { es: 'Qgalería', en: 'Qgalería' },
        place: usfq,
        body: {
          es: 'Dos años y medio construyendo galerías virtuales: más de diez, para web, realidad virtual y realidad aumentada.',
          en: 'Two and a half years building virtual galleries: more than ten, for the web, VR and AR.',
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
          es: 'Un año desarrollando la experiencia de realidad virtual del proyecto de maestría de Alexandra Tamayo.',
          en: 'A year developing the virtual reality experience for Alexandra Tamayo’s master’s project.',
        },
      },
      {
        period: '2021 — 2022',
        title: { es: 'DIM Web', en: 'DIM Web' },
        place: { es: 'USFQ · Medios Interactivos', en: 'USFQ · Interactive Media' },
        body: {
          es: 'Diseñé, animé y programé el sitio de la carrera como un videojuego 2D. Estuvo en línea hasta 2024.',
          en: 'I designed, animated and programmed the program’s website as a 2D video game. It stayed online until 2024.',
        },
      },
      {
        period: '2019 — 2024',
        title: { es: 'Licenciatura en Medios Interactivos', en: 'BA in Interactive Media' },
        place: usfq,
        body: {
          es: 'Subespecialización en Arte y Tecnología.',
          en: 'Minor in Art and Technology.',
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
