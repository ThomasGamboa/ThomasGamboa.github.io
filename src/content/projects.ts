import type { ArchiveProject, Collaborator, ExternalLink } from './types.ts';

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

const playOnItch = { es: 'Jugar en itch.io', en: 'Play on itch.io' };

const interactionDesign = { es: ['Diseño de interacción'], en: ['Interaction design'] } as const;

export const archiveProjects: readonly ArchiveProject[] = [
  {
    id: 'where-is-my-black-coffee',
    title: 'Where Is My Black Coffee',
    publishedOn: '2024-07-14',
    summary: {
      es: 'Un café negro tiene que llegar caliente a quien lo espera, cruzando una cocina llena de obstáculos. Cada salto derrama un poco. Mi primer juego y mi primera game jam, con modelos, sprites y sonido hechos desde cero.',
      en: 'A black coffee has to reach its drinker while it is still hot, across a kitchen full of obstacles. Every jump spills a little. My first game and my first game jam, with models, sprites and sound made from scratch.',
    },
    cover: null,
    fields: { es: ['Diseño de videojuegos'], en: ['Game design'] },
    tools: ['Unity', 'WebGL'],
    collaborators: [],
    links: [itchLink('where-is-my-coffee', playOnItch)],
  },
  {
    id: 'eco-recorrido-virtual',
    title: 'Eco recorrido virtual',
    publishedOn: '2024',
    summary: {
      es: 'Recorrido virtual por la exhibición de diseño COCOA de la USFQ en 2024, para visitarla desde el navegador cuando ya no está montada.',
      en: 'A virtual walkthrough of USFQ’s 2024 COCOA design exhibition, so it can still be visited from the browser after it came down.',
    },
    cover: null,
    fields: interactionDesign,
    tools: ['Unity', 'WebGL'],
    collaborators: [],
    links: [
      itchLink('eco-recorrido-virtual', { es: 'Recorrer en itch.io', en: 'Walk it on itch.io' }),
    ],
  },
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
  },
  {
    id: 'alma-virtual',
    title: 'Alma Virtual',
    publishedOn: '2024-03-06',
    summary: null,
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
      itchLink('dim-web', playOnItch),
    ],
  },
];
