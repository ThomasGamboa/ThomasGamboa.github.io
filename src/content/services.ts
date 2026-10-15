import type { ServiceCategory } from './types.ts';

export const serviceCategories: readonly ServiceCategory[] = [
  {
    id: 'interactive',
    kind: 'primary',
    title: { es: 'Videojuegos e instalaciones', en: 'Games and installations' },
    services: [
      {
        id: 'game-prototype',
        name: { es: 'Prototipo jugable', en: 'Playable prototype' },
        description: {
          es: 'Prototipo en Unity para probar mecánicas, ritmo y dirección visual antes de producir.',
          en: 'Unity prototype to test mechanics, pacing and visual direction before production.',
        },
        startingPrice: { amount: 1500, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'interactive-installation',
        name: { es: 'Instalación interactiva', en: 'Interactive installation' },
        description: {
          es: 'Para museos, exposiciones y eventos, con sensores, Kinect, proyección, Arduino o TouchDesigner. Del concepto al montaje.',
          en: 'For museums, exhibitions and events, with sensors, Kinect, projection, Arduino or TouchDesigner. From concept to installation.',
        },
        startingPrice: { amount: 3500, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'meta-quest-vr',
        name: {
          es: 'Experiencia de realidad virtual para Meta Quest',
          en: 'Virtual reality experience for Meta Quest',
        },
        description: {
          es: 'Interacción con manos o mandos, rendimiento estable y publicación en la tienda.',
          en: 'Hand or controller interaction, stable performance and store release.',
        },
        startingPrice: { amount: 5000, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'mobile-game',
        name: { es: 'Videojuego completo para móviles', en: 'Full mobile game' },
        description: {
          es: 'Diseño, programación, arte, pruebas y versión para las tiendas.',
          en: 'Design, programming, art, testing and store builds.',
        },
        startingPrice: { amount: 9000, currency: 'USD' },
        requirements: [],
      },
    ],
  },
  {
    id: 'web',
    kind: 'primary',
    title: { es: 'Web', en: 'Web' },
    services: [
      {
        id: 'web-experience-design',
        name: { es: 'Diseño de experiencia web', en: 'Web experience design' },
        description: {
          es: 'Concepto, estructura, interfaz y animación antes del desarrollo. Se puede contratar por separado.',
          en: 'Concept, structure, interface and motion before development. Available on its own.',
        },
        startingPrice: { amount: 1800, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'custom-website',
        name: { es: 'Sitio web a medida', en: 'Custom website' },
        description: {
          es: 'Diseño y desarrollo de un sitio rápido, accesible y optimizado para buscadores.',
          en: 'Design and development of a fast, accessible, search-optimized site.',
        },
        startingPrice: { amount: 2200, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'web-3d-experience',
        name: { es: 'Experiencia web 3D', en: '3D web experience' },
        description: {
          es: 'Experiencias web interactivas en 3D con Three.js y WebGL, a partir de un diseño terminado.',
          en: 'Interactive 3D web experiences with Three.js and WebGL, from a finished design.',
        },
        startingPrice: { amount: 5000, currency: 'USD' },
        note: {
          es: 'No incluye diseño. Si no lo tienes, añade el diseño de experiencia web.',
          en: 'Design not included. If you do not have one, add web experience design.',
        },
        requirements: [{ type: 'design-ready', alternativeServiceId: 'web-experience-design' }],
      },
    ],
  },
  {
    id: 'additional',
    kind: 'additional',
    title: { es: 'Extras', en: 'Extras' },
    services: [
      {
        id: 'custom-art',
        name: { es: 'Arte 3D o pixel art a medida', en: 'Custom 3D or pixel art' },
        description: {
          es: 'Modelos, sprites, entornos o interfaces para tu proyecto.',
          en: 'Models, sprites, environments or interfaces for your project.',
        },
        startingPrice: { amount: 600, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'external-integrations',
        name: { es: 'Integraciones y APIs', en: 'Integrations and APIs' },
        description: {
          es: 'Conexión con plataformas, bases de datos, pagos o servicios de terceros.',
          en: 'Connecting platforms, databases, payments or third-party services.',
        },
        startingPrice: { amount: 600, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'launch-support',
        name: { es: 'Soporte después del lanzamiento', en: 'Post-launch support' },
        description: {
          es: 'Un mes de correcciones y ajustes después de publicar.',
          en: 'One month of fixes and adjustments after release.',
        },
        startingPrice: { amount: 450, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'deployment',
        name: { es: 'Publicación', en: 'Release' },
        description: {
          es: 'Publicación en producción o en tiendas (Google Play, App Store, Meta Horizon, itch.io).',
          en: 'Release to production or stores (Google Play, App Store, Meta Horizon, itch.io).',
        },
        startingPrice: { amount: 350, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'hosting-infrastructure',
        name: { es: 'Hosting e infraestructura', en: 'Hosting and infrastructure' },
        description: {
          es: 'Alojamiento, servidores y servicios del proyecto.',
          en: 'Hosting, servers and project services.',
        },
        startingPrice: { amount: 250, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'domain-setup',
        name: { es: 'Dominio y certificados', en: 'Domain and certificates' },
        description: {
          es: 'Conexión y configuración de tu dominio, DNS y HTTPS.',
          en: 'Connecting and configuring your domain, DNS and HTTPS.',
        },
        startingPrice: { amount: 150, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'custom-technical-needs',
        name: { es: 'Necesidades técnicas específicas', en: 'Specific technical needs' },
        description: {
          es: 'Requisitos propios del proyecto, presupuestados según alcance.',
          en: 'Project-specific requirements, quoted by scope.',
        },
        startingPrice: null,
        requirements: [],
      },
    ],
  },
];

export function findService(serviceId: string) {
  for (const category of serviceCategories) {
    const service = category.services.find((candidate) => candidate.id === serviceId);
    if (service) {
      return service;
    }
  }
  return undefined;
}
