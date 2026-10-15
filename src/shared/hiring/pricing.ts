import { hireFields } from '../../content/hiring.ts';
import { findService } from '../../content/services.ts';
import type { Service } from '../../content/types.ts';
import type { Price } from '../i18n/format.ts';
import type { HireRequest } from './request.ts';

export interface PricingSummary {
  readonly services: readonly Service[];
  readonly addons: readonly Service[];
  readonly startingTotal: Price | null;
  readonly budgetBelowStart: boolean;
}

function resolveServices(ids: readonly string[]): Service[] {
  return ids.flatMap((id) => {
    const service = findService(id);
    return service ? [service] : [];
  });
}

export function budgetMaximum(budget: string): number | null {
  const option = hireFields
    .find((field) => field.id === 'budget')
    ?.options?.find((candidate) => candidate.value === budget);
  return option?.maximum ?? null;
}

export function summarizePricing(
  request: Pick<HireRequest, 'services' | 'addons' | 'budget'>,
): PricingSummary {
  const services = resolveServices(request.services);
  const addons = resolveServices(request.addons);
  const amount = [...services, ...addons].reduce(
    (sum, service) => sum + (service.startingPrice?.amount ?? 0),
    0,
  );
  const startingTotal: Price | null = amount > 0 ? { amount, currency: 'USD' } : null;
  const maximum = budgetMaximum(request.budget);
  return {
    services,
    addons,
    startingTotal,
    budgetBelowStart: startingTotal !== null && maximum !== null && maximum < startingTotal.amount,
  };
}
