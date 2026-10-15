import { profile } from '../../content/profile.ts';
import { archiveProjects } from '../../content/projects.ts';
import { serviceCategories } from '../../content/services.ts';
import { absoluteUrl, site, socialLinks } from '../../content/site.ts';
import type { World } from '../../content/types.ts';
import { type Locale, localeDefinitions, locales } from '../../shared/i18n/locales.ts';
import { homePath } from '../../shared/i18n/paths.ts';
import { mediaLibrary } from '../media.ts';

type Node = Readonly<Record<string, unknown>>;

const personId = absoluteUrl('/#person');
const websiteId = absoluteUrl('/#website');

function personNode(locale: Locale): Node {
  return {
    '@type': 'Person',
    '@id': personId,
    name: profile.name,
    url: absoluteUrl(homePath(locale)),
    jobTitle: profile.role[locale],
    description: profile.summary[locale],
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location.locality,
      addressCountry: profile.location.countryCode,
    },
    knowsAbout: profile.expertise[locale],
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universidad San Francisco de Quito' },
    sameAs: socialLinks.map((link) => link.href),
  };
}

function websiteNode(): Node {
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    url: absoluteUrl('/'),
    name: site.name,
    inLanguage: locales.map((locale) => localeDefinitions[locale].htmlLang),
    publisher: { '@id': personId },
  };
}

function graph(nodes: readonly Node[]): Node {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

function webPageNode(type: string, locale: Locale, path: string, name: string): Node {
  const url = absoluteUrl(path);
  return {
    '@type': type,
    '@id': `${url}#page`,
    url,
    name,
    inLanguage: localeDefinitions[locale].htmlLang,
    isPartOf: { '@id': websiteId },
  };
}

export function homeStructuredData(locale: Locale, path: string, title: string): Node {
  return graph([
    websiteNode(),
    personNode(locale),
    { ...webPageNode('ProfilePage', locale, path, title), mainEntity: { '@id': personId } },
    worksNode(locale, path),
  ]);
}

function worksNode(locale: Locale, path: string): Node {
  return {
    '@type': 'ItemList',
    '@id': `${absoluteUrl(path)}#works`,
    itemListElement: archiveProjects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: project.title,
        description: project.summary?.[locale],
        image: project.cover ? absoluteUrl(mediaLibrary.imageUrl(project.cover)) : undefined,
        dateCreated: project.publishedOn,
        url: `${absoluteUrl(path)}#sheet-${project.id}`,
        creator: { '@id': personId },
        sameAs: project.links.map((link) => link.href),
      },
    })),
  };
}

function trailerNode(world: World, locale: Locale): Node | undefined {
  const video = world.blocks.find((block) => block.type === 'video' && block.provider === 'file');
  if (video?.type !== 'video') {
    return undefined;
  }
  return {
    '@type': 'VideoObject',
    name: video.title[locale],
    description: world.summary[locale],
    thumbnailUrl: absoluteUrl(mediaLibrary.ogImage(video.poster)),
    contentUrl: absoluteUrl(video.id),
    uploadDate: video.uploadDate,
    duration: video.duration,
  };
}

export function hireStructuredData(locale: Locale, path: string, title: string): Node {
  const services = serviceCategories.flatMap((category) =>
    category.services.map(
      (service): Node => ({
        '@type': 'Service',
        name: service.name[locale],
        description: service.description[locale],
        category: category.title[locale],
        provider: { '@id': personId },
        offers: service.startingPrice
          ? {
              '@type': 'Offer',
              priceSpecification: {
                '@type': 'PriceSpecification',
                minPrice: service.startingPrice.amount,
                priceCurrency: service.startingPrice.currency,
              },
            }
          : undefined,
      }),
    ),
  );

  return graph([
    websiteNode(),
    personNode(locale),
    { ...webPageNode('WebPage', locale, path, title), about: { '@id': personId } },
    ...services,
  ]);
}

export function worldStructuredData(locale: Locale, path: string, world: World): Node {
  const url = absoluteUrl(path);
  return graph([
    websiteNode(),
    personNode(locale),
    webPageNode('WebPage', locale, path, world.title[locale]),
    {
      '@type': world.schemaType,
      '@id': `${url}#work`,
      name: world.title[locale],
      description: world.summary[locale],
      url,
      inLanguage: localeDefinitions[locale].htmlLang,
      author: { '@id': personId },
      creator: { '@id': personId },
      image: world.cover ? absoluteUrl(mediaLibrary.ogImage(world.cover)) : undefined,
      genre: world.game?.genres,
      gamePlatform: world.game?.platforms,
      trailer: trailerNode(world, locale),
      sameAs: world.links.map((link) => link.href),
    },
  ]);
}
