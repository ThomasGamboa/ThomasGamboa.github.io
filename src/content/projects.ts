import type { ArchiveProject, Collaborator, ExternalLink, MediaReference } from './types.ts';

const carlaMagica: Collaborator = {
  name: 'Carla Mágica',
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
      es: 'Un cuento interactivo sobre los manglares y el mar del Ecuador, pensado para el Museo del Agua Yaku. Se juega con el cuerpo: un Kinect lee tus movimientos y los convierte en la forma de recorrer la historia.',
      en: 'An interactive tale about Ecuador’s mangroves and sea, designed for the Yaku Water Museum. You play it with your body: a Kinect reads your movements and turns them into the way through the story.',
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
    collaborators: [carlaMagica],
    links: [behanceLink('https://www.behance.net/gallery/195281135/Apangora')],
    story: {
      es: [
        'Apangora es una proyección interactiva sobre los ecosistemas marinos del Ecuador: los manglares y humedales de la costa. Antes de diseñar hubo trabajo de campo en el humedal de La Segua, en Manabí, y la historia está construida sobre lo que salió de ese estudio.',
        'Funciona como un cuento. Adultos y niños recorren el manglar y el mar, ayudan a animales atrapados y entienden por qué los manglares importan, en una experiencia pensada para estimular los sentidos.',
        'No hay controles. Un Kinect reconoce los gestos y esa es toda la interfaz: te paras frente a la proyección, en una zona marcada en el piso, y mueves las manos.',
      ],
      en: [
        'Apangora is an interactive projection about Ecuador’s marine ecosystems: the mangroves and wetlands of the coast. Before any design there was fieldwork at La Segua wetland, in Manabí, and the story is built on what came out of that study.',
        'It works like a tale. Adults and children wander the mangrove and the sea, help trapped animals and get why mangroves matter, in an experience made to stimulate the senses.',
        'There are no controllers. A Kinect recognizes gestures and that is the whole interface: you stand in front of the projection, on a marked spot on the floor, and move your hands.',
      ],
    },
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
      es: 'Una obra de realidad virtual sobre la identidad en internet, seleccionada para la bienal BUAM 2023 y expuesta en el Centro de Arte Contemporáneo de Quito y en el Museo Nacional del Cacao.',
      en: 'A virtual reality piece about identity online, selected for the 2023 BUAM biennial and shown at Quito’s Contemporary Art Center and the National Cacao Museum.',
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
    collaborators: [carlaMagica],
    links: [behanceLink('https://www.behance.net/gallery/193245431/Alma-Virtual')],
    story: {
      es: [
        'Una obra de realidad virtual inspirada en los ensayos de Jia Tolentino sobre el yo en internet. No quiere que estés cómodo: busca incomodar lo suficiente como para que pienses en tu identidad en el mundo digital.',
        'El alma virtual se despliega en tres secciones que se abren con portales: la conexión con las plataformas, las prácticas de control entre usuarios y la relación entre algoritmo y usuario, que termina co-creando un mundo único.',
        'Fue uno de los 24 proyectos seleccionados para la Bienal de Arte Multimedial BUAM 2023, «Espacios líquidos: políticas de la pantalla», y se expuso en el Centro de Arte Contemporáneo de Quito y en el Museo Nacional del Cacao de Guayaquil.',
      ],
      en: [
        'A virtual reality piece inspired by Jia Tolentino’s essays on the self online. It does not want you comfortable: it aims to unsettle you just enough to think about your identity in the digital world.',
        'The virtual soul unfolds in three sections opened through portals: our connection to platforms, the ways users police each other and the relationship between algorithm and user that ends up co-creating a world of its own.',
        'It was one of 24 projects selected for the 2023 BUAM Multimedia Art Biennial, “Liquid spaces: politics of the screen”, and was shown at the Contemporary Art Center in Quito and the National Cacao Museum in Guayaquil.',
      ],
    },
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
      es: 'Una aplicación de escritorio para caminar por dos biomas del Ecuador, el bosque nublado y el páramo, y conocer a los animales que viven ahí. Materiales PBR y animación en Unity.',
      en: 'A desktop app for walking through two Ecuadorian biomes, the cloud forest and the páramo, and meeting the animals that live there. PBR materials and animation in Unity.',
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
        'Una aplicación didáctica de escritorio para recorrer dos biomas del Ecuador, el bosque de neblina del Oriente y el páramo, y conocer a la fauna que vive en ellos.',
        'Está hecha en Unity con materiales y assets PBR, retocados en Photoshop para que encajen en cada ambiente. Los animales, la interfaz y la ambientación se animan con las herramientas de animación de Unity.',
        'La interfaz es mínima a propósito: cualquiera puede manejarla sin explicación y quedarse mirando el paisaje.',
      ],
      en: [
        'An educational desktop app for walking through two Ecuadorian biomes, the Amazon cloud forest and the páramo, and meeting the wildlife that lives there.',
        'It is built in Unity with PBR materials and assets, reworked in Photoshop to fit each environment. The animals, the interface and the atmosphere are animated with Unity’s animation tools.',
        'The interface is minimal on purpose: anyone can use it without instructions and just stay to look at the landscape.',
      ],
    },
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
      es: 'Una app móvil para encontrar y publicar eventos culturales en Ecuador, tanto para quien los organiza como para quien solo quiere salir esa noche.',
      en: 'A mobile app for finding and posting cultural events in Ecuador, for the people who organize them and for anyone who just wants to go out tonight.',
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
    collaborators: [carlaMagica],
    links: [behanceLink('https://www.behance.net/gallery/191470123/APPARTE')],
    story: {
      es: [
        'Una app para la cultura local: conciertos, exposiciones, festivales y todo lo que pasa cerca, a un par de toques.',
        'Tiene dos caminos desde el registro. Quien organiza puede crear y publicar eventos; quien solo busca qué hacer puede filtrarlos por tipo, guardarlos y ver el detalle de cada uno.',
        'Está hecha con Ionic y Angular, con estilos en Sass, y el backend es un modelo no relacional sobre Firebase.',
      ],
      en: [
        'An app for local culture: concerts, exhibitions, festivals and everything happening nearby, a couple of taps away.',
        'Sign-up splits into two paths. Organizers can create and publish events; people just looking for plans can filter them by type, save them and open the details.',
        'It is built with Ionic and Angular, styled with Sass, and the backend is a non-relational model on Firebase.',
      ],
    },
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
      es: 'Una línea del tiempo para tablet sobre la historia de la moneda en Ecuador, hecha para el Banco Central y su museo en Cuenca. Las monedas se giran en 3D, desde las macuquinas de 1535.',
      en: 'A tablet timeline of currency in Ecuador, made for the Central Bank and its museum in Cuenca. You can turn the coins in 3D, starting with the macuquinas of 1535.',
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
        'Una aplicación para tablet hecha para el Banco Central del Ecuador y su museo en Cuenca. Recorre la historia de la moneda ecuatoriana en una línea del tiempo: deslizas para avanzar y tocas cada pieza para ampliar la información.',
        'Las monedas están en 3D, con luz, normal maps y rotación en tres ejes, así que puedes girar una macuquina de 1535 y ver su desgaste de cerca. La línea del tiempo usa los componentes 2D de Unity y las animaciones vienen de After Effects.',
        'Se compiló para Android y es exclusiva del museo.',
      ],
      en: [
        'A tablet app made for the Central Bank of Ecuador and its museum in Cuenca. It walks through the history of Ecuadorian currency on a timeline: swipe to move forward, tap any piece to learn more.',
        'The coins are in 3D, with lighting, normal maps and three-axis rotation, so you can turn a macuquina from 1535 and look at its wear up close. The timeline uses Unity’s 2D components and the animation comes from After Effects.',
        'It was built for Android and lives only at the museum.',
      ],
    },
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
      es: 'El sitio de la carrera de Medios Interactivos de la USFQ, disfrazado de videojuego 2D: profesores y estudiantes en pixel art y un camino que se recorre con flechas.',
      en: 'The website for USFQ’s Interactive Media program, dressed up as a 2D video game: teachers and students in pixel art and a path you walk with the arrow keys.',
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
        'El sitio de la carrera de Medios Interactivos de la USFQ, pensado para quienes salen del colegio y están decidiendo qué estudiar. En vez de una página informativa es un videojuego 2D: caminas con las flechas, hablas con profesores y estudiantes y vas encontrando la carrera, las becas y el equipo.',
        'Me encargué de ilustrar, animar, diseñar y programar la experiencia: personajes jugables, props y escenarios en pixel art, todo implementado en Unity y exportado a WebGL.',
        'La idea era mostrar la mezcla de creatividad y programación de la carrera con algo que los estudiantes pudieran hacer al entrar. Estuvo en línea hasta principios de 2024.',
      ],
      en: [
        'The website for USFQ’s Interactive Media program, aimed at people finishing high school and deciding what to study. Instead of an information page it is a 2D video game: you walk with the arrow keys, talk to teachers and students and find the program, the scholarships and the team along the way.',
        'I illustrated, animated, designed and programmed the experience: playable characters, props and pixel art scenery, all implemented in Unity and exported to WebGL.',
        'The point was to show the program’s mix of creativity and code with something students could build once they joined. It stayed online until early 2024.',
      ],
    },
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
