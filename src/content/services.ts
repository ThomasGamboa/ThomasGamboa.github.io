import type { ServiceCategory } from './types.ts';

export const serviceCategories: readonly ServiceCategory[] = [
  {
    id: 'game-development',
    kind: 'primary',
    title: { es: 'Desarrollo de videojuegos', en: 'Game development' },
    services: [
      {
        id: 'game-prototype',
        name: { es: 'Prototipo de videojuego', en: 'Game prototype' },
        description: {
          es: 'Prototipo jugable para validar mecánicas, ritmo y dirección visual antes de la producción.',
          en: 'Playable prototype to validate mechanics, pacing and visual direction before production.',
        },
        startingPrice: { amount: 200, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'meta-quest-vr',
        name: {
          es: 'Experiencia de realidad virtual para Meta Quest',
          en: 'Virtual reality experience for Meta Quest',
        },
        description: {
          es: 'Experiencias inmersivas de realidad virtual desarrolladas para dispositivos Meta Quest.',
          en: 'Immersive virtual reality experiences built for Meta Quest devices.',
        },
        startingPrice: { amount: 700, currency: 'USD' },
        requirements: [],
      },
      {
        id: 'mobile-game',
        name: {
          es: 'Desarrollo completo de videojuego para móviles',
          en: 'Full mobile game development',
        },
        description: {
          es: 'Desarrollo integral de un videojuego para dispositivos móviles, desde el concepto hasta la versión final.',
          en: 'End-to-end development of a mobile game, from concept to final build.',
        },
        startingPrice: { amount: 3000, currency: 'USD' },
        requirements: [],
      },
    ],
  },
  {
    id: 'web-3d-development',
    kind: 'primary',
    title: { es: 'Desarrollo web 3D', en: '3D web development' },
    services: [
      {
        id: 'web-3d-experience',
        name: { es: 'Experiencia web 3D', en: '3D web experience' },
        description: {
          es: 'Desarrollo de experiencias web interactivas en 3D a partir de un diseño definido.',
          en: 'Development of interactive 3D web experiences from an established design.',
        },
        startingPrice: { amount: 1500, currency: 'USD' },
        note: {
          es: 'No incluye la fase de diseño. Si tu proyecto aún no cuenta con un diseño listo para implementar, puedes contratar primero el diseño de la experiencia o incluirlo en la misma solicitud.',
          en: 'Design phase not included. If your project does not yet have a design ready to implement, you can hire the experience design first or include it in the same request.',
        },
        requirements: [{ type: 'design-ready', alternativeServiceId: 'web-experience-design' }],
      },
    ],
  },
  {
    id: 'web-design',
    kind: 'primary',
    title: { es: 'Diseño de experiencias web', en: 'Web experience design' },
    services: [
      {
        id: 'web-experience-design',
        name: { es: 'Diseño de experiencia web', en: 'Web experience design' },
        description: {
          es: 'Diseño completo de una web antes de su desarrollo técnico. Puede contratarse como servicio independiente.',
          en: 'Complete design of a website before technical development. Available as a standalone service.',
        },
        startingPrice: { amount: 500, currency: 'USD' },
        requirements: [],
      },
    ],
  },
  {
    id: 'additional',
    kind: 'additional',
    title: { es: 'Servicios adicionales', en: 'Additional services' },
    services: [
      {
        id: 'deployment',
        name: { es: 'Despliegue y publicación', en: 'Deployment and launch' },
        description: {
          es: 'Publicación del proyecto en producción y verificación final.',
          en: 'Production deployment and final verification.',
        },
        startingPrice: null,
        requirements: [],
      },
      {
        id: 'domain-setup',
        name: { es: 'Configuración de dominio', en: 'Domain setup' },
        description: {
          es: 'Conexión y configuración de tu dominio, DNS y certificados.',
          en: 'Connecting and configuring your domain, DNS and certificates.',
        },
        startingPrice: null,
        requirements: [],
      },
      {
        id: 'hosting-infrastructure',
        name: {
          es: 'Hosting e infraestructura',
          en: 'Hosting and infrastructure',
        },
        description: {
          es: 'Configuración del alojamiento y de la infraestructura que necesita el proyecto.',
          en: 'Setting up the hosting and infrastructure the project needs.',
        },
        startingPrice: null,
        requirements: [],
      },
      {
        id: 'external-integrations',
        name: {
          es: 'Integración de servicios externos',
          en: 'External service integration',
        },
        description: {
          es: 'Conexión con plataformas, APIs y servicios de terceros.',
          en: 'Integration with third-party platforms, APIs and services.',
        },
        startingPrice: null,
        requirements: [],
      },
      {
        id: 'custom-technical-needs',
        name: {
          es: 'Necesidades técnicas específicas',
          en: 'Specific technical needs',
        },
        description: {
          es: 'Requisitos técnicos particulares del proyecto, evaluados según su alcance.',
          en: 'Project-specific technical requirements, assessed according to scope.',
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
