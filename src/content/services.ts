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
          es: 'Un prototipo en Unity para probar mecánicas, ritmo y dirección visual antes de invertir en producción.',
          en: 'A Unity prototype to test mechanics, pacing and visual direction before committing to production.',
        },
        startingPrice: { amount: 1500, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'interactive-installation',
        name: { es: 'Instalación interactiva', en: 'Interactive installation' },
        description: {
          es: 'Piezas para museos, exposiciones y eventos con sensores, Kinect, proyección, Arduino o TouchDesigner, del concepto al montaje.',
          en: 'Pieces for museums, exhibitions and events with sensors, Kinect, projection, Arduino or TouchDesigner, from concept to install.',
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
          es: 'Experiencias inmersivas pensadas para el visor: interacción con las manos o mandos, rendimiento estable y publicación.',
          en: 'Immersive experiences built for the headset: hand or controller interaction, steady performance and release.',
        },
        startingPrice: { amount: 5000, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'mobile-game',
        name: { es: 'Videojuego completo para móviles', en: 'Full mobile game' },
        description: {
          es: 'Desarrollo de principio a fin: diseño, programación, arte, pruebas y versión lista para las tiendas.',
          en: 'End-to-end development: design, programming, art, testing and a store-ready build.',
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
          es: 'Concepto, estructura, interfaz y animación de una web antes de programarla. Se puede contratar por separado.',
          en: 'Concept, structure, interface and motion for a website before it is built. Available on its own.',
        },
        startingPrice: { amount: 1800, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'custom-website',
        name: { es: 'Sitio web a medida', en: 'Custom website' },
        description: {
          es: 'Diseño y desarrollo de un sitio rápido, accesible y bien posicionado, sin plantillas.',
          en: 'Design and development of a fast, accessible, search-friendly site, no templates.',
        },
        startingPrice: { amount: 2200, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'web-3d-experience',
        name: { es: 'Experiencia web 3D', en: '3D web experience' },
        description: {
          es: 'Desarrollo de experiencias web interactivas en 3D con Three.js y WebGL, a partir de un diseño definido.',
          en: 'Interactive 3D web experiences built with Three.js and WebGL from an established design.',
        },
        startingPrice: { amount: 5000, currency: 'USD' },
        note: {
          es: 'No incluye la fase de diseño. Si aún no tienes un diseño listo para implementar, añade el diseño de experiencia web a la misma solicitud.',
          en: 'Design phase not included. If you do not have a design ready to implement yet, add web experience design to the same request.',
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
          es: 'Modelos, sprites, entornos o interfaces hechos para tu proyecto.',
          en: 'Models, sprites, environments or interfaces made for your project.',
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
          es: 'Publicación en producción o en tiendas (Google Play, App Store, Meta Horizon, itch.io) y verificación final.',
          en: 'Release to production or stores (Google Play, App Store, Meta Horizon, itch.io) and final checks.',
        },
        startingPrice: { amount: 350, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'hosting-infrastructure',
        name: { es: 'Hosting e infraestructura', en: 'Hosting and infrastructure' },
        description: {
          es: 'Alojamiento, servidores y servicios que el proyecto necesita para funcionar.',
          en: 'Hosting, servers and the services the project needs to run.',
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
          es: 'Requisitos particulares del proyecto que se evalúan según su alcance.',
          en: 'Project-specific requirements assessed according to scope.',
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
