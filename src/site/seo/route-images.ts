import { archiveProjects } from '../../content/projects.ts';
import { absoluteUrl } from '../../content/site.ts';
import type { ContentBlock, MediaReference, World } from '../../content/types.ts';
import { worlds } from '../../content/worlds.ts';
import { mediaLibrary } from '../media.ts';
import type { Route } from '../routes.ts';
import type { SitemapImage } from './indexing.ts';

function blockImages(block: ContentBlock): MediaReference[] {
  switch (block.type) {
    case 'media':
      return [block.image];
    case 'gallery':
      return [...block.items];
    case 'video':
      return [block.poster];
    default:
      return [];
  }
}

function worldImages(world: World): MediaReference[] {
  return [...(world.cover ? [world.cover] : []), ...world.blocks.flatMap(blockImages)];
}

function homeImages(): MediaReference[] {
  return [
    ...worlds.flatMap((world) => (world.cover ? [world.cover] : [])),
    ...archiveProjects.flatMap((project) => [
      ...(project.cover ? [project.cover] : []),
      ...project.gallery,
    ]),
  ];
}

export function routeImages(route: Route): readonly SitemapImage[] {
  const view = route.view;
  const world = view.kind === 'world' ? worlds.find((item) => item.id === view.worldId) : null;
  const references = view.kind === 'home' ? homeImages() : world ? worldImages(world) : [];
  const urls = new Set(
    references.map((reference) => absoluteUrl(mediaLibrary.imageUrl(reference))),
  );
  return [...urls].map((url) => ({ url }));
}
