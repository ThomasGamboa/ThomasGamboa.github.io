import type { LocalizedText } from '../shared/i18n/locales.ts';

export type HireFieldId =
  | 'services'
  | 'addons'
  | 'projectType'
  | 'description'
  | 'designStatus'
  | 'platforms'
  | 'headset'
  | 'materials'
  | 'requirements'
  | 'budget'
  | 'timeline'
  | 'deadline'
  | 'name'
  | 'email'
  | 'company'
  | 'website'
  | 'consent';

export type HireFieldKind =
  | 'services'
  | 'addons'
  | 'select'
  | 'single-choice'
  | 'multi-choice'
  | 'text'
  | 'email'
  | 'url'
  | 'textarea'
  | 'date'
  | 'checkbox';

export interface ChoiceOption {
  readonly value: string;
  readonly label: LocalizedText;
  readonly maximum?: number;
}

export interface HireField {
  readonly id: HireFieldId;
  readonly kind: HireFieldKind;
  readonly label: LocalizedText;
  readonly hint?: LocalizedText;
  readonly required: boolean;
  readonly options?: readonly ChoiceOption[];
  readonly whenServices?: readonly string[];
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly autocomplete?: string;
}

export interface HireStep {
  readonly id: string;
  readonly title: LocalizedText;
  readonly description: LocalizedText;
  readonly fields: readonly HireFieldId[];
}

export const hireFields: readonly HireField[] = [
  {
    id: 'services',
    kind: 'services',
    label: { es: 'Servicios principales', en: 'Main services' },
    hint: {
      es: 'Selecciona uno o varios. Los precios son iniciales.',
      en: 'Choose one or more. Prices are starting points.',
    },
    required: true,
  },
  {
    id: 'addons',
    kind: 'addons',
    label: { es: 'Servicios adicionales', en: 'Additional services' },
    hint: {
      es: 'Opcionales. Se presupuestan según el alcance.',
      en: 'Optional. Quoted according to scope.',
    },
    required: false,
  },
  {
    id: 'projectType',
    kind: 'select',
    label: { es: 'Tipo de proyecto', en: 'Project type' },
    required: true,
    options: [
      { value: 'new', label: { es: 'Proyecto nuevo', en: 'New project' } },
      {
        value: 'existing',
        label: {
          es: 'Continuación de un proyecto existente',
          en: 'Continuation of an existing project',
        },
      },
      {
        value: 'prototype',
        label: { es: 'Prueba de concepto o prototipo', en: 'Proof of concept or prototype' },
      },
      { value: 'other', label: { es: 'Otro', en: 'Other' } },
    ],
  },
  {
    id: 'description',
    kind: 'textarea',
    label: { es: 'Descripción del proyecto', en: 'Project description' },
    hint: {
      es: 'Objetivo, público, alcance, funcionalidades clave y referencias.',
      en: 'Goal, audience, scope, key features and references.',
    },
    required: true,
    minLength: 80,
    maxLength: 4000,
  },
  {
    id: 'designStatus',
    kind: 'single-choice',
    label: { es: 'Estado del diseño', en: 'Design status' },
    hint: {
      es: 'El desarrollo web 3D comienza a partir de un diseño listo para implementar.',
      en: '3D web development starts from a design that is ready to implement.',
    },
    required: true,
    whenServices: ['web-3d-experience', 'web-experience-design'],
    options: [
      {
        value: 'ready',
        label: {
          es: 'Diseño completo, listo para implementar',
          en: 'Complete design, ready to implement',
        },
      },
      {
        value: 'partial',
        label: {
          es: 'Bocetos, referencias o diseño parcial',
          en: 'Sketches, references or partial design',
        },
      },
      { value: 'none', label: { es: 'Todavía no hay diseño', en: 'No design yet' } },
    ],
  },
  {
    id: 'platforms',
    kind: 'multi-choice',
    label: { es: 'Plataformas móviles', en: 'Mobile platforms' },
    required: true,
    whenServices: ['mobile-game'],
    options: [
      { value: 'android', label: { es: 'Android', en: 'Android' } },
      { value: 'ios', label: { es: 'iOS', en: 'iOS' } },
    ],
  },
  {
    id: 'headset',
    kind: 'select',
    label: { es: 'Dispositivo Meta Quest', en: 'Meta Quest device' },
    required: true,
    whenServices: ['meta-quest-vr'],
    options: [
      { value: 'quest-3', label: { es: 'Meta Quest 3', en: 'Meta Quest 3' } },
      { value: 'quest-3s', label: { es: 'Meta Quest 3S', en: 'Meta Quest 3S' } },
      { value: 'multiple', label: { es: 'Varios modelos', en: 'Several models' } },
      { value: 'undecided', label: { es: 'Aún sin definir', en: 'Not decided yet' } },
    ],
  },
  {
    id: 'materials',
    kind: 'textarea',
    label: { es: 'Materiales disponibles', en: 'Available materials' },
    hint: {
      es: 'Enlaces a diseños, documentos, arte, guiones o repositorios.',
      en: 'Links to designs, documents, art, scripts or repositories.',
    },
    required: false,
    maxLength: 2000,
  },
  {
    id: 'requirements',
    kind: 'textarea',
    label: { es: 'Requisitos técnicos', en: 'Technical requirements' },
    hint: {
      es: 'Integraciones, dispositivos objetivo, rendimiento, hosting u otras restricciones.',
      en: 'Integrations, target devices, performance, hosting or other constraints.',
    },
    required: false,
    maxLength: 2000,
  },
  {
    id: 'budget',
    kind: 'select',
    label: { es: 'Presupuesto estimado', en: 'Estimated budget' },
    required: true,
    options: [
      { value: 'under-500', label: { es: 'Menos de 500 USD', en: 'Under 500 USD' }, maximum: 500 },
      { value: '500-1500', label: { es: '500 – 1.500 USD', en: '500 – 1,500 USD' }, maximum: 1500 },
      {
        value: '1500-3000',
        label: { es: '1.500 – 3.000 USD', en: '1,500 – 3,000 USD' },
        maximum: 3000,
      },
      {
        value: '3000-6000',
        label: { es: '3.000 – 6.000 USD', en: '3,000 – 6,000 USD' },
        maximum: 6000,
      },
      { value: '6000-plus', label: { es: 'Más de 6.000 USD', en: 'Over 6,000 USD' } },
    ],
  },
  {
    id: 'timeline',
    kind: 'select',
    label: { es: 'Plazo estimado', en: 'Estimated timeline' },
    required: true,
    options: [
      { value: 'under-1-month', label: { es: 'Menos de 1 mes', en: 'Less than 1 month' } },
      { value: '1-3-months', label: { es: '1 a 3 meses', en: '1 to 3 months' } },
      { value: '3-6-months', label: { es: '3 a 6 meses', en: '3 to 6 months' } },
      { value: '6-plus-months', label: { es: 'Más de 6 meses', en: 'More than 6 months' } },
      { value: 'flexible', label: { es: 'Flexible', en: 'Flexible' } },
    ],
  },
  {
    id: 'deadline',
    kind: 'date',
    label: { es: 'Fecha límite (opcional)', en: 'Deadline (optional)' },
    required: false,
  },
  {
    id: 'name',
    kind: 'text',
    label: { es: 'Nombre o empresa', en: 'Name or company' },
    required: true,
    minLength: 2,
    maxLength: 120,
    autocomplete: 'name',
  },
  {
    id: 'email',
    kind: 'email',
    label: { es: 'Correo electrónico', en: 'Email' },
    required: true,
    maxLength: 200,
    autocomplete: 'email',
  },
  {
    id: 'company',
    kind: 'text',
    label: { es: 'Empresa o estudio (opcional)', en: 'Company or studio (optional)' },
    required: false,
    maxLength: 120,
    autocomplete: 'organization',
  },
  {
    id: 'website',
    kind: 'url',
    label: { es: 'Sitio web o portafolio (opcional)', en: 'Website or portfolio (optional)' },
    required: false,
    maxLength: 300,
    autocomplete: 'url',
  },
  {
    id: 'consent',
    kind: 'checkbox',
    label: {
      es: 'Acepto que estos datos se usen únicamente para responder a esta solicitud.',
      en: 'I agree that this information will only be used to answer this request.',
    },
    required: true,
  },
];

export const hireSteps: readonly HireStep[] = [
  {
    id: 'services',
    title: { es: 'Servicios', en: 'Services' },
    description: {
      es: 'Elige qué necesitas. Verás el precio inicial de cada servicio.',
      en: 'Choose what you need. Each service shows its starting price.',
    },
    fields: ['services', 'addons'],
  },
  {
    id: 'project',
    title: { es: 'Proyecto', en: 'Project' },
    description: {
      es: 'Cuéntame qué quieres construir y en qué punto está.',
      en: 'Tell me what you want to build and where it stands.',
    },
    fields: [
      'projectType',
      'description',
      'designStatus',
      'platforms',
      'headset',
      'materials',
      'requirements',
    ],
  },
  {
    id: 'planning',
    title: { es: 'Plazos y presupuesto', en: 'Timeline and budget' },
    description: {
      es: 'Un rango realista ayuda a preparar una propuesta viable.',
      en: 'A realistic range helps prepare a viable proposal.',
    },
    fields: ['budget', 'timeline', 'deadline'],
  },
  {
    id: 'contact',
    title: { es: 'Contacto', en: 'Contact' },
    description: {
      es: 'Te responderé a este correo con los siguientes pasos.',
      en: 'I will reply to this email with the next steps.',
    },
    fields: ['name', 'email', 'company', 'website', 'consent'],
  },
  {
    id: 'review',
    title: { es: 'Revisión', en: 'Review' },
    description: {
      es: 'Comprueba el resumen antes de enviar la solicitud.',
      en: 'Check the summary before sending the request.',
    },
    fields: [],
  },
];

export const hireCopy = {
  next: { es: 'Continuar', en: 'Continue' },
  previous: { es: 'Atrás', en: 'Back' },
  submit: { es: 'Enviar solicitud', en: 'Send request' },
  sending: { es: 'Enviando…', en: 'Sending…' },
  step: { es: 'Paso', en: 'Step' },
  of: { es: 'de', en: 'of' },
  summaryServices: { es: 'Servicios seleccionados', en: 'Selected services' },
  summaryTotal: { es: 'Total inicial estimado', en: 'Estimated starting total' },
  summaryAddons: { es: 'Servicios adicionales', en: 'Additional services' },
  summaryNone: { es: 'Ninguno', en: 'None' },
  summaryEdit: { es: 'Editar', en: 'Edit' },
  addDesign: { es: 'Añadir el diseño de la experiencia', en: 'Add the experience design' },
  budgetBelow: {
    es: 'Tu presupuesto está por debajo del precio inicial de los servicios seleccionados. Puedes enviarlo igualmente; lo tendré en cuenta al responder.',
    en: 'Your budget is below the starting price of the selected services. You can still send it; I will take it into account when replying.',
  },
  success: {
    es: 'Solicitud enviada. Recibirás una respuesta en tu correo.',
    en: 'Request sent. You will receive a reply by email.',
  },
  failure: {
    es: 'No se pudo enviar la solicitud. Inténtalo de nuevo en unos minutos.',
    en: 'The request could not be sent. Please try again in a few minutes.',
  },
  unavailable: {
    es: 'El envío de solicitudes aún no está activo. Vuelve pronto.',
    en: 'Request submission is not active yet. Please check back soon.',
  },
  noscript: {
    es: 'Activa JavaScript para enviar la solicitud.',
    en: 'Enable JavaScript to send the request.',
  },
  verification: { es: 'Verificación', en: 'Verification' },
} as const satisfies Record<string, LocalizedText>;

export const hireErrors = {
  required: { es: 'Este campo es obligatorio.', en: 'This field is required.' },
  'too-short': { es: 'Añade un poco más de detalle.', en: 'Please add a little more detail.' },
  'too-long': { es: 'El texto es demasiado largo.', en: 'The text is too long.' },
  'invalid-email': { es: 'Introduce un correo válido.', en: 'Enter a valid email address.' },
  'invalid-url': {
    es: 'Introduce una URL válida (https://…).',
    en: 'Enter a valid URL (https://…).',
  },
  'invalid-option': { es: 'Selecciona una opción válida.', en: 'Select a valid option.' },
  'invalid-date': { es: 'Introduce una fecha futura.', en: 'Enter a future date.' },
  'service-required': {
    es: 'Selecciona al menos un servicio principal.',
    en: 'Select at least one main service.',
  },
  'design-required': {
    es: 'El desarrollo web 3D necesita un diseño listo. Añade el diseño de la experiencia o indica que ya lo tienes.',
    en: '3D web development needs a ready design. Add the experience design or confirm you already have one.',
  },
} as const satisfies Record<string, LocalizedText>;

export type HireErrorCode = keyof typeof hireErrors;
