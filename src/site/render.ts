import { worlds } from '../content/worlds.ts';
import { renderDocument } from './layouts/document.ts';
import type { PageContext, PageDocument } from './page.ts';
import { renderHirePage } from './pages/hire.ts';
import { renderHomePage } from './pages/home.ts';
import { renderNotFoundPage } from './pages/not-found.ts';
import { renderWorldPage } from './pages/world.ts';
import type { Route } from './routes.ts';

function renderView(context: PageContext): PageDocument {
  const { view } = context.route;
  switch (view.kind) {
    case 'home':
      return renderHomePage(context);
    case 'hire':
      return renderHirePage(context);
    case 'world': {
      const world = worlds.find((candidate) => candidate.id === view.worldId);
      if (!world) {
        throw new Error(`Route "${context.route.id}" references unknown world "${view.worldId}"`);
      }
      return renderWorldPage(context, world);
    }
    case 'not-found':
      return renderNotFoundPage(context);
  }
}

export function renderRoute(route: Route, buildDate = new Date()): string {
  const context: PageContext = {
    route,
    locale: route.locale,
    year: buildDate.getFullYear(),
  };
  return renderDocument(context, renderView(context));
}
