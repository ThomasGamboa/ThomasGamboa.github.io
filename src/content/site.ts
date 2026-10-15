import type { ExternalLink } from './types.ts';

export const site = {
  origin: 'https://thomasgamboa.github.io',
  name: 'Thomas Gamboa',
  themeColor: '#000000',
  indexable: false,
  googleSiteVerification: null as string | null,
} as const;

export const hiring = {
  endpoint: null as string | null,
  turnstileSiteKey: null as string | null,
};

export const socialLinks: readonly ExternalLink[] = [
  {
    kind: 'instagram',
    href: 'https://www.instagram.com/sr.ansiedad/',
    label: { es: 'Instagram', en: 'Instagram' },
  },
  {
    kind: 'behance',
    href: 'https://www.behance.net/thomasgamboa2',
    label: { es: 'Behance', en: 'Behance' },
  },
];

export function absoluteUrl(path: string): string {
  return new URL(path, site.origin).href;
}
