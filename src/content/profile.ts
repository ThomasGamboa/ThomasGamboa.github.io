import type { Localized, LocalizedText } from '../shared/i18n/locales.ts';

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
    es: 'Diseñador interactivo y artista de nuevos medios en Quito, Ecuador. Desarrollo videojuegos, experiencias web 3D y proyectos multimedia donde el diseño, la programación y el arte digital se cruzan.',
    en: 'Interactive designer and new media artist based in Quito, Ecuador. I develop video games, 3D web experiences and multimedia projects where design, code and digital art meet.',
  } satisfies LocalizedText,
  about: {
    heading: { es: 'Sobre mí', en: 'About' } satisfies LocalizedText,
    paragraphs: {
      es: [
        'Soy Thomas Gamboa, diseñador interactivo y artista de nuevos medios con base en Quito, Ecuador. Mi enfoque va más allá de una sola disciplina: trabajo en el cruce entre el diseño, la programación y el arte digital para construir experiencias que se exploran, no solo se miran.',
        'Desarrollo videojuegos, experiencias web 3D, aplicaciones y piezas interactivas. Mi lenguaje visual se nutre de los proyectos 3D, de la escena de Awwwards y del trabajo creativo con TouchDesigner: entornos generativos y experiencias digitales experimentales.',
        'Actualmente desarrollo The Nightbounds, un roguelike de mundo abierto inspirado en la cultura ecuatoriana, y VoxelNest, mi proyecto de creación de assets para videojuegos en Unity.',
      ],
      en: [
        'I am Thomas Gamboa, an interactive designer and new media artist based in Quito, Ecuador. My approach goes beyond a single discipline: I work where design, code and digital art intersect to build experiences that are meant to be explored, not just viewed.',
        'I develop video games, 3D web experiences, apps and interactive pieces. My visual language draws on 3D work, the Awwwards scene and creative work made with TouchDesigner: generative environments and experimental digital experiences.',
        'I am currently developing The Nightbounds, an open-world roguelike inspired by Ecuadorian culture, and VoxelNest, my project dedicated to creating game assets for Unity.',
      ],
    } satisfies Localized<readonly string[]>,
  },
  expertise: {
    es: [
      'Diseño interactivo',
      'Arte de nuevos medios',
      'Desarrollo web 3D',
      'Desarrollo de videojuegos',
      'Realidad virtual',
      'Unity',
      'Three.js',
      'WebGL',
    ],
    en: [
      'Interaction design',
      'New media art',
      '3D web development',
      'Game development',
      'Virtual reality',
      'Unity',
      'Three.js',
      'WebGL',
    ],
  } satisfies Localized<readonly string[]>,
} as const;
