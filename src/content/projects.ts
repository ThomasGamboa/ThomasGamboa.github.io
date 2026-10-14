import type { ArchiveProject, Collaborator, ExternalLink } from './types.ts';

const carlaMagica: Collaborator = {
  name: 'Carla Mágica',
  href: 'https://www.behance.net/carlamagica',
};

function behanceLink(href: string): ExternalLink {
  return { kind: 'behance', href, label: { es: 'Ver en Behance', en: 'View on Behance' } };
}

const interactionDesign = { es: ['Diseño de interacción'], en: ['Interaction design'] } as const;

export const archiveProjects: readonly ArchiveProject[] = [
  {
    id: 'apangora',
    title: 'Apangora',
    publishedOn: '2024-04-01',
    summary: {
      es: 'Experiencia interactiva desarrollada en Unity con Microsoft Kinect.',
      en: 'Interactive experience developed in Unity with Microsoft Kinect.',
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
      es: 'Recorrido interactivo por la biodiversidad del Ecuador desarrollado en Unity.',
      en: 'Interactive journey through the biodiversity of Ecuador, developed in Unity.',
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
      es: 'Aplicación móvil para descubrir eventos cercanos.',
      en: 'Mobile app for discovering nearby events.',
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
      es: 'Aplicación interactiva con una línea del tiempo sobre la moneda en Ecuador.',
      en: 'Interactive app featuring a timeline of currency in Ecuador.',
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
      es: 'Sitio web interactivo en formato de videojuego 2D, desarrollado con Unity para WebGL.',
      en: 'Interactive website built as a 2D video game, developed with Unity for WebGL.',
    },
    fields: interactionDesign,
    tools: ['Unity 3D', 'C#', 'WebGL', 'JavaScript', 'Adobe Photoshop', 'Adobe Illustrator'],
    collaborators: [],
    links: [behanceLink('https://www.behance.net/gallery/190330623/DIM-Web')],
  },
];
