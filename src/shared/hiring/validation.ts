import { type HireErrorCode, type HireFieldId, hireFields } from '../../content/hiring.ts';
import { findService } from '../../content/services.ts';
import { additionalServices, type HireRequest, isFieldActive, primaryServices } from './request.ts';

export interface HireError {
  readonly field: HireFieldId;
  readonly code: HireErrorCode;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isFutureDate(value: string, today: Date): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T23:59:59Z`);
  return !Number.isNaN(date.getTime()) && date.getTime() >= today.getTime();
}

function answerOf(request: HireRequest, id: HireFieldId): string | boolean | readonly string[] {
  return request[id];
}

function isEmpty(value: string | boolean | readonly string[]): boolean {
  if (typeof value === 'boolean') {
    return !value;
  }
  return value.length === 0;
}

function checkDesignRequirements(request: HireRequest): HireError | null {
  for (const id of request.services) {
    const service = findService(id);
    for (const requirement of service?.requirements ?? []) {
      const designReady = request.designStatus === 'ready';
      const alternativeSelected = request.services.includes(requirement.alternativeServiceId);
      if (requirement.type === 'design-ready' && !designReady && !alternativeSelected) {
        return { field: 'designStatus', code: 'design-required' };
      }
    }
  }
  return null;
}

export function validateHireRequest(
  request: HireRequest,
  fields: readonly HireFieldId[] = hireFields.map((field) => field.id),
  today = new Date(),
): HireError[] {
  const errors: HireError[] = [];
  const scope = new Set(fields);

  for (const field of hireFields) {
    const catalog = field.kind === 'services' || field.kind === 'addons';
    if (catalog || !scope.has(field.id) || !isFieldActive(field, request.services)) {
      continue;
    }
    const value = answerOf(request, field.id);
    if (isEmpty(value)) {
      if (field.required) {
        errors.push({ field: field.id, code: 'required' });
      }
      continue;
    }

    if (typeof value === 'string') {
      if (field.minLength && value.length < field.minLength) {
        errors.push({ field: field.id, code: 'too-short' });
      } else if (field.maxLength && value.length > field.maxLength) {
        errors.push({ field: field.id, code: 'too-long' });
      } else if (field.kind === 'email' && !emailPattern.test(value)) {
        errors.push({ field: field.id, code: 'invalid-email' });
      } else if (field.kind === 'url' && !isValidUrl(value)) {
        errors.push({ field: field.id, code: 'invalid-url' });
      } else if (field.kind === 'date' && !isFutureDate(value, today)) {
        errors.push({ field: field.id, code: 'invalid-date' });
      } else if (field.options && !field.options.some((option) => option.value === value)) {
        errors.push({ field: field.id, code: 'invalid-option' });
      }
    }

    if (Array.isArray(value) && field.options) {
      const allowed = new Set(field.options.map((option) => option.value));
      if (value.some((item) => !allowed.has(item))) {
        errors.push({ field: field.id, code: 'invalid-option' });
      }
    }
  }

  if (scope.has('services')) {
    const primaryIds = new Set(primaryServices.map((service) => service.id));
    if (request.services.length === 0) {
      errors.push({ field: 'services', code: 'service-required' });
    } else if (request.services.some((id) => !primaryIds.has(id))) {
      errors.push({ field: 'services', code: 'invalid-option' });
    }
  }
  if (scope.has('addons')) {
    const addonIds = new Set(additionalServices.map((service) => service.id));
    if (request.addons.some((id) => !addonIds.has(id))) {
      errors.push({ field: 'addons', code: 'invalid-option' });
    }
  }
  if (scope.has('designStatus') && !errors.some((error) => error.field === 'designStatus')) {
    const designError = checkDesignRequirements(request);
    if (designError) {
      errors.push(designError);
    }
  }

  return errors.filter(
    (error, index) => errors.findIndex((candidate) => candidate.field === error.field) === index,
  );
}
