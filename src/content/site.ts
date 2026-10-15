import { assetStorePublisher, itchProfile } from './catalog.ts';
import type { ExternalLink } from './types.ts';

export const site = {
  origin: 'https://thomasgamboa.github.io',
  name: 'Thomas Gamboa',
  themeColor: '#000000',
  indexable: true,
  googleSiteVerification: 'z_LKLq8c4JsYf8vJ2gZhzg7hPCsIRAoTx444xusy5E4' as string | null,
} as const;

export const contactMail = {
  user: 'vedaobmagsamoht',
  host: 'moc.liamg',
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
  {
    kind: 'itch',
    href: itchProfile,
    label: { es: 'itch.io', en: 'itch.io' },
  },
  {
    kind: 'unity',
    href: assetStorePublisher,
    label: { es: 'Unity Asset Store', en: 'Unity Asset Store' },
  },
];

export function absoluteUrl(path: string): string {
  return new URL(path, site.origin).href;
}
