import { hiring } from '../content/site.ts';

export interface HiringConfig {
  readonly endpoint: string | null;
  readonly siteKey: string | null;
}

export function resolveHiringConfig(): HiringConfig {
  return {
    endpoint: process.env.PUBLIC_HIRE_ENDPOINT || hiring.endpoint,
    siteKey: process.env.PUBLIC_TURNSTILE_SITE_KEY || hiring.turnstileSiteKey,
  };
}
