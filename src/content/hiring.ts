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
    label: { es: '¿Qué necesitas?', en: 'What do you need?' },
    hint: {
      es: 'Elige uno o varios. Los precios son de partida; el presupuesto final depende del alcance.',
      en: 'Choose one or more. Prices are starting points; the final quote depends on scope.',
    },
    required: true,
  },
  {
    id: 'addons',
    kind: 'addons',
    label: { es: 'Extras', en: 'Extras' },
    hint: {
      es: 'Opcionales. Se suman al precio de partida.',
      en: 'Optional. They add to the starting price.',
    },
    required: false,
  },
  {
    id: 'projectType',
    kind: 'select',
    label: { es: '¿En qué punto está?', en: 'Where does it stand?' },
    required: true,
    options: [
      {
        value: 'new',
        label: { es: 'Es una idea y quiero empezar', en: 'It is an idea and I want to start' },
      },
      {
        value: 'existing',
        label: {
          es: 'Ya existe y necesito continuarlo o mejorarlo',
          en: 'It exists and I need to continue or improve it',
        },
      },
      {
        value: 'prototype',
        label: {
          es: 'Necesito un prototipo o una prueba de concepto',
          en: 'I need a prototype or a proof of concept',
        },
      },
      { value: 'other', label: { es: 'Otro', en: 'Other' } },
    ],
  },
  {
    id: 'description',
    kind: 'textarea',
    label: { es: 'Cuéntame el proyecto', en: 'Tell me about the project' },
    hint: {
      es: 'Qué es, para quién, qué debería sentir o poder hacer la gente y qué es imprescindible. Mínimo 80 caracteres.',
      en: 'What it is, who it is for, what people should feel or be able to do and what is essential. At least 80 characters.',
    },
    required: true,
    minLength: 80,
    maxLength: 4000,
  },
  {
    id: 'designStatus',
    kind: 'single-choice',
    label: { es: '¿Tienes diseño?', en: 'Do you have a design?' },
    hint: {
      es: 'La experiencia web 3D se desarrolla a partir de un diseño listo para implementar.',
      en: 'The 3D web experience is built from a design that is ready to implement.',
    },
    required: true,
    whenServices: ['web-3d-experience', 'web-experience-design'],
    options: [
      {
        value: 'ready',
        label: {
          es: 'Sí, completo y listo para desarrollar',
          en: 'Yes, complete and ready to build',
        },
      },
      {
        value: 'partial',
        label: {
          es: 'Tengo bocetos, referencias o un diseño parcial',
          en: 'I have sketches, references or a partial design',
        },
      },
      { value: 'none', label: { es: 'Todavía no', en: 'Not yet' } },
    ],
  },
  {
    id: 'platforms',
    kind: 'multi-choice',
    label: { es: 'Plataformas', en: 'Platforms' },
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
    label: { es: 'Visor', en: 'Headset' },
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
    label: { es: 'Referencias y materiales (opcional)', en: 'References and materials (optional)' },
    hint: {
      es: 'Enlaces a diseños, documentos, moodboards, arte, guiones o repositorios.',
      en: 'Links to designs, documents, moodboards, art, scripts or repositories.',
    },
    required: false,
    maxLength: 2000,
  },
  {
    id: 'requirements',
    kind: 'textarea',
    label: { es: 'Requisitos técnicos (opcional)', en: 'Technical requirements (optional)' },
    hint: {
      es: 'Integraciones, dispositivos, rendimiento, espacio de montaje, hosting u otras restricciones.',
      en: 'Integrations, devices, performance, installation space, hosting or other constraints.',
    },
    required: false,
    maxLength: 2000,
  },
  {
    id: 'budget',
    kind: 'select',
    label: { es: 'Presupuesto', en: 'Budget' },
    hint: {
      es: 'Los proyectos empiezan en 1.500 USD. Un rango honesto me ayuda a proponer el alcance correcto.',
      en: 'Projects start at 1,500 USD. An honest range helps me propose the right scope.',
    },
    required: true,
    options: [
      {
        value: 'under-2000',
        label: { es: 'Menos de 2.000 USD', en: 'Under 2,000 USD' },
        maximum: 2000,
      },
      {
        value: '2000-5000',
        label: { es: '2.000 – 5.000 USD', en: '2,000 – 5,000 USD' },
        maximum: 5000,
      },
      {
        value: '5000-10000',
        label: { es: '5.000 – 10.000 USD', en: '5,000 – 10,000 USD' },
        maximum: 10000,
      },
      {
        value: '10000-20000',
        label: { es: '10.000 – 20.000 USD', en: '10,000 – 20,000 USD' },
        maximum: 20000,
      },
      { value: '20000-plus', label: { es: 'Más de 20.000 USD', en: 'Over 20,000 USD' } },
    ],
  },
  {
    id: 'timeline',
    kind: 'select',
    label: { es: 'Plazo', en: 'Timeline' },
    hint: {
      es: 'Los proyectos urgentes tienen un recargo.',
      en: 'Rush projects carry a surcharge.',
    },
    required: true,
    options: [
      {
        value: 'under-1-month',
        label: { es: 'Urgente: menos de 1 mes', en: 'Rush: less than 1 month' },
      },
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
    hint: {
      es: 'Si hay un lanzamiento, una exposición o un evento con fecha fija.',
      en: 'If there is a launch, an exhibition or an event with a fixed date.',
    },
    required: false,
  },
  {
    id: 'name',
    kind: 'text',
    label: { es: 'Tu nombre', en: 'Your name' },
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
    label: {
      es: 'Empresa, estudio o institución (opcional)',
      en: 'Company, studio or institution (optional)',
    },
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
      es: 'Elige lo que necesitas. Cada servicio muestra su precio de partida.',
      en: 'Pick what you need. Each service shows its starting price.',
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
    title: { es: 'Presupuesto y plazos', en: 'Budget and timeline' },
    description: {
      es: 'Con un rango realista puedo proponerte un alcance que sí se pueda cumplir.',
      en: 'With a realistic range I can propose a scope that can actually be delivered.',
    },
    fields: ['budget', 'timeline', 'deadline'],
  },
  {
    id: 'contact',
    title: { es: 'Contacto', en: 'Contact' },
    description: {
      es: 'Te respondo personalmente a este correo con los siguientes pasos.',
      en: 'I will reply personally to this email with the next steps.',
    },
    fields: ['name', 'email', 'company', 'website', 'consent'],
  },
  {
    id: 'review',
    title: { es: 'Revisión', en: 'Review' },
    description: {
      es: 'Revisa el resumen antes de enviar.',
      en: 'Check the summary before sending.',
    },
    fields: [],
  },
];

export const hireCopy = {
  next: { es: 'Continuar', en: 'Continue' },
  previous: { es: 'Atrás', en: 'Back' },
  submit: { es: 'Enviar solicitud', en: 'Send request' },
  submitByMail: { es: 'Preparar el correo', en: 'Prepare the email' },
  mailOpened: {
    es: 'Tu solicitud está lista. Envíala a {email} desde Gmail, Outlook o tu aplicación de correo, o cópiala y pégala donde prefieras.',
    en: 'Your request is ready. Send it to {email} from Gmail, Outlook or your email app, or copy it and paste it wherever you like.',
  },
  openGmail: { es: 'Abrir en Gmail', en: 'Open in Gmail' },
  openOutlook: { es: 'Abrir en Outlook', en: 'Open in Outlook' },
  fallbackLabel: { es: 'Tu solicitud', en: 'Your request' },
  copyRequest: { es: 'Copiar solicitud', en: 'Copy request' },
  copied: { es: 'Solicitud copiada', en: 'Request copied' },
  openMail: { es: 'Abrir mi aplicación de correo', en: 'Open my email app' },
  sending: { es: 'Enviando…', en: 'Sending…' },
  step: { es: 'Paso', en: 'Step' },
  of: { es: 'de', en: 'of' },
  summaryServices: { es: 'Servicios', en: 'Services' },
  summaryTotal: { es: 'Precio de partida', en: 'Starting price' },
  summaryAddons: { es: 'Extras', en: 'Extras' },
  summaryNone: { es: 'Ninguno', en: 'None' },
  summaryEdit: { es: 'Editar', en: 'Edit' },
  addDesign: { es: 'Añadir el diseño de experiencia web', en: 'Add web experience design' },
  budgetBelow: {
    es: 'Tu presupuesto está por debajo del precio de partida de lo que elegiste. Puedes enviarlo igual, pero lo más probable es que haya que reducir el alcance.',
    en: 'Your budget is below the starting price of what you picked. You can still send it, but the scope will most likely need to shrink.',
  },
  success: {
    es: 'Solicitud enviada. Te escribo a tu correo con los siguientes pasos.',
    en: 'Request sent. I will write to your email with the next steps.',
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
