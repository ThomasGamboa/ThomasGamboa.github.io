import { type HireField, type HireFieldId, hireFields } from '../../content/hiring.ts';
import { serviceCategories } from '../../content/services.ts';
import type { Service } from '../../content/types.ts';
import { isLocale, type Locale } from '../i18n/locales.ts';

export interface HireRequest {
  readonly locale: Locale;
  readonly services: readonly string[];
  readonly addons: readonly string[];
  readonly projectType: string;
  readonly description: string;
  readonly designStatus: string;
  readonly platforms: readonly string[];
  readonly headset: string;
  readonly materials: string;
  readonly requirements: string;
  readonly budget: string;
  readonly timeline: string;
  readonly deadline: string;
  readonly name: string;
  readonly email: string;
  readonly company: string;
  readonly website: string;
  readonly consent: boolean;
}

export interface HireSubmission {
  readonly request: HireRequest;
  readonly verificationToken: string;
  readonly startedAt: number;
  readonly trap: string;
}

const listFields = new Set<HireFieldId>(['services', 'addons', 'platforms']);

export const primaryServices: readonly Service[] = serviceCategories
  .filter((category) => category.kind === 'primary')
  .flatMap((category) => category.services);

export const additionalServices: readonly Service[] = serviceCategories
  .filter((category) => category.kind === 'additional')
  .flatMap((category) => category.services);

export function fieldById(id: HireFieldId): HireField {
  const field = hireFields.find((candidate) => candidate.id === id);
  if (!field) {
    throw new Error(`Unknown hire field "${id}"`);
  }
  return field;
}

export function isFieldActive(field: HireField, services: readonly string[]): boolean {
  return !field.whenServices || field.whenServices.some((id) => services.includes(id));
}

function readText(source: Readonly<Record<string, unknown>>, key: string, limit = 5000): string {
  const value = source[key];
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function readList(source: Readonly<Record<string, unknown>>, key: string): string[] {
  const value = source[key];
  if (!Array.isArray(value)) {
    return [];
  }
  return [...new Set(value.filter((item): item is string => typeof item === 'string'))].slice(
    0,
    32,
  );
}

export function normalizeHireRequest(input: unknown): HireRequest {
  const source = (typeof input === 'object' && input !== null ? input : {}) as Readonly<
    Record<string, unknown>
  >;
  const locale = readText(source, 'locale');
  const text = (id: HireFieldId) => readText(source, id, fieldById(id).maxLength ?? 300);
  const request: HireRequest = {
    locale: isLocale(locale) ? locale : 'es',
    services: readList(source, 'services'),
    addons: readList(source, 'addons'),
    projectType: text('projectType'),
    description: text('description'),
    designStatus: text('designStatus'),
    platforms: readList(source, 'platforms'),
    headset: text('headset'),
    materials: text('materials'),
    requirements: text('requirements'),
    budget: text('budget'),
    timeline: text('timeline'),
    deadline: text('deadline'),
    name: text('name'),
    email: text('email'),
    company: text('company'),
    website: text('website'),
    consent: source.consent === true,
  };

  const cleared: Record<string, string | readonly string[]> = {};
  for (const field of hireFields) {
    if (!isFieldActive(field, request.services)) {
      cleared[field.id] = listFields.has(field.id) ? [] : '';
    }
  }
  return { ...request, ...cleared };
}

export function normalizeSubmission(input: unknown): HireSubmission {
  const source = (typeof input === 'object' && input !== null ? input : {}) as Readonly<
    Record<string, unknown>
  >;
  return {
    request: normalizeHireRequest(source.request),
    verificationToken: readText(source, 'verificationToken', 4096),
    startedAt: typeof source.startedAt === 'number' ? source.startedAt : 0,
    trap: readText(source, 'trap', 200),
  };
}
