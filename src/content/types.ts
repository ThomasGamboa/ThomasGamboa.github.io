import type { Price } from '../shared/i18n/format.ts';
import type { Localized, LocalizedText } from '../shared/i18n/locales.ts';

export type ExternalLinkKind = 'behance' | 'instagram' | 'linkedin' | 'github' | 'itch' | 'website';

export interface ExternalLink {
  readonly kind: ExternalLinkKind;
  readonly href: string;
  readonly label: LocalizedText;
}

export interface Collaborator {
  readonly name: string;
  readonly href?: string;
}

export interface SeoCopy {
  readonly title: LocalizedText;
  readonly description: LocalizedText;
}

export type ContentBlock =
  | {
      readonly type: 'text';
      readonly heading?: LocalizedText;
      readonly paragraphs: Localized<readonly string[]>;
    }
  | {
      readonly type: 'stack';
      readonly heading: LocalizedText;
      readonly items: readonly string[];
    }
  | {
      readonly type: 'links';
      readonly heading: LocalizedText;
      readonly items: readonly ExternalLink[];
    };

export type WorldId = 'nightbounds' | 'voxelnest' | 'archive';

export type WorldSchemaType = 'VideoGame' | 'CreativeWork' | 'CollectionPage';

export interface World {
  readonly id: WorldId;
  readonly slug: string;
  readonly anchor: LocalizedText;
  readonly eyebrow: LocalizedText;
  readonly title: LocalizedText;
  readonly summary: LocalizedText;
  readonly schemaType: WorldSchemaType;
  readonly page: { readonly seo: SeoCopy } | null;
  readonly blocks: readonly ContentBlock[];
  readonly projectIds: readonly string[];
}

export interface ArchiveProject {
  readonly id: string;
  readonly title: string;
  readonly publishedOn: string;
  readonly summary: LocalizedText | null;
  readonly fields: Localized<readonly string[]>;
  readonly tools: readonly string[];
  readonly collaborators: readonly Collaborator[];
  readonly links: readonly ExternalLink[];
}

export type ChapterId = 'hero' | 'about' | WorldId | 'contact';

export interface Chapter {
  readonly id: ChapterId;
  readonly anchor: LocalizedText;
  readonly label: LocalizedText;
}

export type ServiceRequirement = {
  readonly type: 'design-ready';
  readonly alternativeServiceId: string;
};

export interface Service {
  readonly id: string;
  readonly name: LocalizedText;
  readonly description: LocalizedText;
  readonly startingPrice: Price | null;
  readonly note?: LocalizedText;
  readonly requirements: readonly ServiceRequirement[];
}

export interface ServiceCategory {
  readonly id: string;
  readonly title: LocalizedText;
  readonly services: readonly Service[];
}
