import type { ArchiveProject, Collaborator, ExternalLink, MediaReference } from './types.ts';

const carlaTorres: Collaborator = {
  name: 'Carla Torres',
  href: 'https://www.behance.net/carlamagica',
};

function behanceLink(href: string): ExternalLink {
  return { kind: 'behance', href, label: { es: 'Ver en Behance', en: 'View on Behance' } };
}

function itchLink(slug: string, label: ExternalLink['label']): ExternalLink {
  return { kind: 'itch', href: `https://thomasgamboa.itch.io/${slug}`, label };
}

function shot(project: string, index: number, es: string, en: string): MediaReference {
  return {
    src: `projects/${project}/${String(index).padStart(2, '0')}.webp`,
    alt: { es, en },
  };
}

const interactionDesign = { es: ['Diseño de interacción'], en: ['Interaction design'] } as const;

export const archiveProjects: readonly ArchiveProject[] = [
  {
    id: 'apangora',
    title: 'Apangora',
    publishedOn: '2024-04-01',
    summary: {
      es: 'Instalación interactiva sobre los manglares y el mar del Ecuador, expuesta en el Museo del Agua Yaku. Se controla con el cuerpo mediante un Kinect.',
      en: 'Interactive installation about Ecuador’s mangroves and sea, exhibited at the Yaku Water Museum. It is controlled with the body through a Kinect.',
    },
    cover: {
      src: 'projects/apangora/cover.png',
      alt: {
        es: 'Apangora, instalación interactiva: título sobre un bosque iluminado',
        en: 'Apangora, interactive installation: title over a lit forest',
      },
    },
    fields: interactionDesign,
    tools: ['Unity 3D', 'Microsoft Kinect', 'Visual Studio Code'],
    collaborators: [carlaTorres],
    links: [behanceLink('https://www.behance.net/gallery/195281135/Apangora')],
    story: {
      es: [
        'Proyección interactiva sobre los manglares y humedales de la costa ecuatoriana, basada en trabajo de campo en el humedal de La Segua, en Manabí.',
        'Funciona como un cuento: el público recorre el manglar y el mar, ayuda a animales atrapados y aprende por qué estos ecosistemas importan.',
        'No hay controles. Un Kinect reconoce los gestos de quien está frente a la proyección.',
        'Con Carla Torres ganamos el Premio COCOA 2024 y el premio Proyectos IT Universidades de Revista IT. Se expuso en el Museo del Agua Yaku, en Quito.',
      ],
      en: [
        'Interactive projection about the mangroves and wetlands of the Ecuadorian coast, based on fieldwork at La Segua wetland in Manabí.',
        'It works like a tale: visitors move through the mangrove and the sea, help trapped animals and learn why these ecosystems matter.',
        'There are no controllers. A Kinect reads the gestures of whoever stands in front of the projection.',
        'With Carla Torres we won the 2024 COCOA Award and Revista IT’s IT University Projects award. It was exhibited at the Yaku Water Museum in Quito.',
      ],
    },
    awards: [
      { es: 'Ganador del Premio COCOA 2024', en: 'Winner of the 2024 COCOA Award' },
      {
        es: 'Ganador del premio Proyectos IT Universidades 2024, Revista IT',
        en: 'Winner of the 2024 IT University Projects award, Revista IT',
      },
    ],
    gallery: [
      shot(
        'apangora',
        1,
        'Título de Apangora sobre un fondo marino con plantas acuáticas',
        'Apangora title over an underwater scene with aquatic plants',
      ),
      shot(
        'apangora',
        2,
        'Visitantes moviendo los brazos frente a la proyección, bajo el texto «Controla la experiencia sin ningún tipo de hardware adicional»',
        'Visitors moving their arms in front of the projection, under the line “Control the experience without any extra hardware”',
      ),
      shot(
        'apangora',
        3,
        'Tres escenas: un claro iluminado, animales atrapados en jaulas bajo el agua y el aviso para acercar las manos al espíritu del agua',
        'Three scenes: a lit clearing, animals trapped in underwater cages and the prompt to reach for the water spirit',
      ),
      shot(
        'apangora',
        4,
        'Esquema del espacio de exposición: proyección, Kinect a cinco metros y zona segura para el usuario',
        'Exhibition layout: projection, a Kinect five meters away and a safe zone for the visitor',
      ),
    ],
    video: {
      id: 's4hzrtrbzrc',
      title: { es: 'Apangora en funcionamiento', en: 'Apangora in action' },
    },
  },
  {
    id: 'alma-virtual',
    title: 'Alma Virtual',
    publishedOn: '2024-03-06',
    summary: {
      es: 'Obra de realidad virtual sobre la identidad en internet. Seleccionada para la bienal BUAM 2023 y expuesta en el Centro de Arte Contemporáneo de Quito y en el Museo Nacional del Cacao.',
      en: 'Virtual reality piece about identity online. Selected for the 2023 BUAM biennial and exhibited at Quito’s Contemporary Art Center and the National Cacao Museum.',
    },
    cover: {
      src: 'projects/alma-virtual/cover.jpg',
      alt: {
        es: 'Alma Virtual: escaleras y puertas suspendidas sobre el agua',
        en: 'Alma Virtual: stairs and doors suspended above water',
      },
    },
    fields: interactionDesign,
    tools: ['Unity 3D', 'Adobe Photoshop', 'Adobe Audition'],
    collaborators: [carlaTorres],
    links: [behanceLink('https://www.behance.net/gallery/193245431/Alma-Virtual')],
    story: {
      es: [
        'Obra de realidad virtual basada en los ensayos de Jia Tolentino sobre el yo en internet. Plantea una reflexión incómoda sobre la identidad digital.',
        'Tiene tres secciones conectadas por portales: la relación con las plataformas, el control entre usuarios y la interacción entre algoritmo y usuario.',
        'Fue uno de los 24 proyectos seleccionados para la Bienal de Arte Multimedial BUAM 2023, «Espacios líquidos: políticas de la pantalla». Se expuso en el Centro de Arte Contemporáneo de Quito y en el Museo Nacional del Cacao de Guayaquil.',
      ],
      en: [
        'Virtual reality piece based on Jia Tolentino’s essays on the self online. It raises an uncomfortable question about digital identity.',
        'It has three sections connected by portals: our relationship with platforms, control between users and the interaction between algorithm and user.',
        'It was one of 24 projects selected for the 2023 BUAM Multimedia Art Biennial, “Liquid spaces: politics of the screen”. It was exhibited at the Contemporary Art Center in Quito and the National Cacao Museum in Guayaquil.',
      ],
    },
    awards: [],
    gallery: [
      shot(
        'alma-virtual',
        1,
        'Escaleras y puertas suspendidas sobre el agua bajo un cielo abierto',
        'Stairs and doors suspended above water under an open sky',
      ),
      shot(
        'alma-virtual',
        2,
        'Figura humana de líneas rosas frente a un panel de términos y condiciones',
        'A human figure made of pink lines facing a terms and conditions panel',
      ),
      shot(
        'alma-virtual',
        3,
        'Esferas oscuras con ojos de luz flotando sobre un suelo violeta',
        'Dark spheres with glowing eyes floating over a violet floor',
      ),
      shot(
        'alma-virtual',
        4,
        'Torre de luces cian rodeada de anillos de nubes',
        'A tower of cyan lights wrapped in rings of cloud',
      ),
      shot(
        'alma-virtual',
        5,
        'Visitante con gafas de realidad virtual frente a una pared azul iluminada',
        'A visitor wearing a VR headset in front of a lit blue wall',
      ),
      shot(
        'alma-virtual',
        6,
        'Visitante recorriendo la obra en la exposición de la BUAM',
        'A visitor exploring the piece at the BUAM exhibition',
      ),
      shot(
        'alma-virtual',
        7,
        'Visitante con gafas de realidad virtual levantando un mando junto a una puerta de madera',
        'A visitor in a VR headset raising a controller next to a wooden door',
      ),
      shot(
        'alma-virtual',
        8,
        'Gafas de realidad virtual sobre un pedestal frente a una proyección azul',
        'A VR headset on a plinth in front of a blue projection',
      ),
    ],
    video: null,
  },
  {
    id: 'ecuador-biodiversity-tour',
    title: 'Ecuador Biodiversity Tour',
    publishedOn: '2024-02-22',
    summary: {
      es: 'Aplicación de escritorio para recorrer el bosque nublado y el páramo del Ecuador y conocer su fauna. Hecha en Unity con materiales PBR.',
      en: 'Desktop app for exploring Ecuador’s cloud forest and páramo and their wildlife. Built in Unity with PBR materials.',
    },
    cover: {
      src: 'projects/ecuador-biodiversity-tour/cover.png',
      alt: {
        es: 'Ecuador Biodiversity Tour en pantalla: menú sobre un bosque tropical',
        en: 'Ecuador Biodiversity Tour on screen: menu over a tropical forest',
      },
    },
    fields: {
      es: ['Diseño de interacción', 'Diseño gráfico'],
      en: ['Interaction design', 'Graphic design'],
    },
    tools: ['Unity 3D', 'C#', 'Adobe Photoshop'],
    collaborators: [],
    links: [behanceLink('https://www.behance.net/gallery/192208583/Ecuador-Biodiversity-Tour')],
    story: {
      es: [
        'Aplicación didáctica para recorrer dos biomas del Ecuador, el bosque de neblina del Oriente y el páramo, y conocer su fauna.',
        'Desarrollada en Unity con materiales y assets PBR ajustados en Photoshop. Los animales, la interfaz y el entorno están animados con las herramientas de Unity.',
        'La interfaz es mínima para que cualquiera la use sin instrucciones.',
      ],
      en: [
        'Educational app for exploring two Ecuadorian biomes, the Amazon cloud forest and the páramo, and their wildlife.',
        'Built in Unity with PBR materials and assets adjusted in Photoshop. The animals, interface and environment are animated with Unity’s tools.',
        'The interface is minimal so anyone can use it without instructions.',
      ],
    },
    awards: [],
    gallery: [
      shot(
        'ecuador-biodiversity-tour',
        1,
        'Título de Ecuador Biodiversity Tour sobre un valle andino con niebla',
        'Ecuador Biodiversity Tour title over a misty Andean valley',
      ),
      shot(
        'ecuador-biodiversity-tour',
        2,
        'Menú para elegir entre el Oriente y el páramo en un monitor',
        'Menu for choosing between the Amazon and the páramo on a monitor',
      ),
      shot(
        'ecuador-biodiversity-tour',
        3,
        'Recorrido por el bosque del Oriente con una ficha informativa',
        'Walking through the Amazon forest with an information card',
      ),
      shot(
        'ecuador-biodiversity-tour',
        4,
        'Un venado en el páramo junto a su ficha informativa',
        'A deer in the páramo next to its information card',
      ),
      shot(
        'ecuador-biodiversity-tour',
        5,
        'Cuatro pantallas de la aplicación: páramo, menú de biomas, jaguar en el bosque y sendero con niebla',
        'Four app screens: páramo, biome menu, a jaguar in the forest and a misty trail',
      ),
    ],
    video: null,
  },
  {
    id: 'apparte',
    title: 'APPARTE',
    publishedOn: '2024-02-14',
    summary: {
      es: 'App móvil para encontrar y publicar eventos culturales en Ecuador.',
      en: 'Mobile app for finding and posting cultural events in Ecuador.',
    },
    cover: {
      src: 'projects/apparte/cover.png',
      alt: {
        es: 'APPARTE en un teléfono: lista de eventos cercanos',
        en: 'APPARTE on a phone: list of nearby events',
      },
    },
    fields: interactionDesign,
    tools: ['Ionic', 'Angular', 'Firebase', 'Figma', 'Adobe Illustrator', 'Adobe After Effects'],
    collaborators: [carlaTorres],
    links: [behanceLink('https://www.behance.net/gallery/191470123/APPARTE')],
    story: {
      es: [
        'App para encontrar conciertos, exposiciones y festivales cercanos.',
        'Tiene dos tipos de cuenta: gestores, que crean y publican eventos, y público, que los busca, filtra y guarda.',
        'Desarrollada con Ionic y Angular, estilos en Sass y un backend no relacional en Firebase.',
      ],
      en: [
        'App for finding nearby concerts, exhibitions and festivals.',
        'It has two account types: organizers, who create and publish events, and the public, who search, filter and save them.',
        'Built with Ionic and Angular, styled with Sass, with a non-relational backend on Firebase.',
      ],
    },
    awards: [],
    gallery: [
      shot(
        'apparte',
        1,
        'Dos teléfonos con la pantalla de registro de AppArte sobre fondo turquesa',
        'Two phones showing the AppArte sign-up screen on a turquoise background',
      ),
      shot(
        'apparte',
        2,
        'Teléfonos con la lista de eventos cercanos y los eventos guardados',
        'Phones showing nearby events and saved events',
      ),
      shot(
        'apparte',
        3,
        'Pantallas para crear un evento y registrarse, con una capibara ilustrada',
        'Screens for creating an event and signing up, with an illustrated capybara',
      ),
      shot(
        'apparte',
        4,
        'Cuatro pantallas: eventos cercanos, guardados, crear un evento y detalle de un concierto',
        'Four screens: nearby events, saved, create an event and a concert’s details',
      ),
    ],
    video: null,
  },
  {
    id: 'app-bce-cuenca',
    title: 'APP BCE Cuenca',
    publishedOn: '2024-02-06',
    summary: {
      es: 'Línea del tiempo para tablet sobre la historia de la moneda en Ecuador, hecha para el museo del Banco Central en Cuenca. Incluye monedas en 3D.',
      en: 'Tablet timeline on the history of currency in Ecuador, made for the Central Bank museum in Cuenca. Includes coins in 3D.',
    },
    cover: {
      src: 'projects/app-bce-cuenca/cover.png',
      alt: {
        es: 'APP BCE Cuenca en una tableta: línea del tiempo de la moneda en Ecuador',
        en: 'APP BCE Cuenca on a tablet: timeline of currency in Ecuador',
      },
    },
    fields: interactionDesign,
    tools: ['Unity 3D', 'Adobe Illustrator', 'Adobe After Effects'],
    collaborators: [],
    links: [behanceLink('https://www.behance.net/gallery/190920111/APP-BCE-Cuenca')],
    story: {
      es: [
        'Aplicación para tablet hecha para el Banco Central del Ecuador y su museo en Cuenca. Recorre la historia de la moneda ecuatoriana en una línea del tiempo interactiva.',
        'Las monedas se pueden rotar en 3D, con iluminación y normal maps. La línea del tiempo usa los componentes 2D de Unity y las animaciones se hicieron en After Effects.',
        'Compilada para Android y disponible solo en el museo.',
      ],
      en: [
        'Tablet app made for the Central Bank of Ecuador and its museum in Cuenca. It covers the history of Ecuadorian currency in an interactive timeline.',
        'The coins can be rotated in 3D, with lighting and normal maps. The timeline uses Unity’s 2D components and the animations were made in After Effects.',
        'Built for Android and available only at the museum.',
      ],
    },
    awards: [],
    gallery: [
      shot(
        'app-bce-cuenca',
        1,
        'Tableta con la portada animada de La moneda en Ecuador sobre fondo rojo',
        'Tablet showing the animated title of La moneda en Ecuador on a red background',
      ),
      shot(
        'app-bce-cuenca',
        2,
        'Una macuquina girando en 3D en la pantalla de la tableta',
        'A macuquina coin spinning in 3D on the tablet screen',
      ),
      shot(
        'app-bce-cuenca',
        3,
        'Línea del tiempo con las macuquinas de primer tipo, de 1535 a 1652',
        'Timeline with first-type macuquinas, from 1535 to 1652',
      ),
      shot(
        'app-bce-cuenca',
        4,
        'Billete antiguo de un peso en la pantalla de detalle',
        'An old one-peso banknote on the detail screen',
      ),
      shot(
        'app-bce-cuenca',
        5,
        'Cuatro pantallas de la aplicación: portada, billete, línea del tiempo y moneda',
        'Four app screens: title, banknote, timeline and coin',
      ),
    ],
    video: null,
  },
  {
    id: 'dim-web',
    title: 'DIM Web',
    publishedOn: '2024-01-30',
    summary: {
      es: 'Sitio web de la carrera de Medios Interactivos de la USFQ, hecho como videojuego 2D en pixel art.',
      en: 'Website for USFQ’s Interactive Media program, built as a 2D pixel art video game.',
    },
    cover: {
      src: 'projects/dim-web/cover.png',
      alt: {
        es: 'DIM Web en un monitor: personaje pixel art junto a un cartel',
        en: 'DIM Web on a monitor: pixel art character next to a sign',
      },
    },
    fields: interactionDesign,
    tools: ['Unity 3D', 'C#', 'WebGL', 'JavaScript', 'Adobe Photoshop', 'Adobe Illustrator'],
    collaborators: [],
    links: [
      behanceLink('https://www.behance.net/gallery/190330623/DIM-Web'),
      itchLink('dim-web', { es: 'Jugar en itch.io', en: 'Play on itch.io' }),
    ],
    story: {
      es: [
        'Sitio de la carrera de Medios Interactivos de la USFQ, dirigido a estudiantes de colegio. Es un videojuego 2D: se recorre con las flechas y la información sobre la carrera, las becas y el equipo aparece en el camino.',
        'Ilustré, animé, diseñé y programé la experiencia: personajes jugables, props y escenarios en pixel art, implementados en Unity y exportados a WebGL.',
        'Estuvo en línea hasta principios de 2024.',
      ],
      en: [
        'Website for USFQ’s Interactive Media program, aimed at high school students. It is a 2D video game: you move with the arrow keys and information about the program, scholarships and team appears along the way.',
        'I illustrated, animated, designed and programmed it: playable characters, props and pixel art scenery, built in Unity and exported to WebGL.',
        'It was online until early 2024.',
      ],
    },
    awards: [],
    gallery: [
      shot(
        'dim-web',
        1,
        'Cuatro escenas del sitio en pixel art: el logo de la carrera, el equipo, una graduación con fuegos artificiales y la sección de becas',
        'Four pixel art scenes from the site: the program logo, the team, a graduation with fireworks and the scholarships section',
      ),
      shot(
        'dim-web',
        2,
        'Personajes en pixel art sobre un jardín de flores, con el título «Personajes»',
        'Pixel art characters on a flower garden, titled “Personajes”',
      ),
      shot(
        'dim-web',
        3,
        'Edificio de la USFQ en pixel art con dos leones de piedra, bajo el texto «Diseño, animación, programación y más»',
        'The USFQ building in pixel art with two stone lions, under the line “Design, animation, programming and more”',
      ),
      shot(
        'dim-web',
        4,
        'Sprite animado de una estudiante con poncho',
        'Animated sprite of a student wearing a poncho',
      ),
      shot(
        'dim-web',
        5,
        'Sprite animado de un graduado con birrete',
        'Animated sprite of a graduate in a cap',
      ),
      shot(
        'dim-web',
        6,
        'Sprite animado de un personaje con máscara roja que escupe fuego',
        'Animated sprite of a character in a red mask breathing fire',
      ),
      shot(
        'dim-web',
        7,
        'Perro negro en pixel art moviendo la cola',
        'A black pixel art dog wagging its tail',
      ),
      shot(
        'dim-web',
        8,
        'Dos sprites de un profesor sentado que saluda',
        'Two sprites of a seated teacher waving',
      ),
    ],
    video: null,
  },
];
