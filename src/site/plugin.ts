import type { ServerResponse } from 'node:http';
import path from 'node:path';
import { type Connect, normalizePath, type Plugin, type ViteDevServer } from 'vite';
import { palette } from '../shared/design/palette.ts';
import { renderFavicon } from './brand.ts';
import { renderRoute } from './render.ts';
import { buildRoutes, type Route } from './routes.ts';
import { renderRobots, renderSitemap } from './seo/indexing.ts';

interface TextResponse {
  readonly status: number;
  readonly contentType: string;
  readonly body: string;
}

interface StaticFile {
  readonly fileName: string;
  readonly contentType: string;
  readonly body: string;
}

function buildStaticFiles(routes: readonly Route[]): readonly StaticFile[] {
  return [
    { fileName: 'sitemap.xml', contentType: 'application/xml', body: renderSitemap(routes) },
    { fileName: 'robots.txt', contentType: 'text/plain', body: renderRobots() },
    { fileName: 'favicon.svg', contentType: 'image/svg+xml', body: renderFavicon(palette.signal) },
  ];
}

function send(response: ServerResponse, { status, contentType, body }: TextResponse): void {
  response.statusCode = status;
  response.setHeader('Content-Type', `${contentType}; charset=utf-8`);
  response.end(body);
}

function createDevHandler(server: ViteDevServer, routes: readonly Route[]) {
  const routesByPath = new Map<string, Route>();
  for (const route of routes) {
    routesByPath.set(route.path, route);
    routesByPath.set(`/${route.outputFile}`, route);
  }
  const notFoundRoute = routes.find((route) => route.view.kind === 'not-found');
  const staticFiles = buildStaticFiles(routes);

  return async (
    request: Connect.IncomingMessage,
    response: ServerResponse,
    next: Connect.NextFunction,
  ) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      next();
      return;
    }

    try {
      const url = new URL(request.url ?? '/', 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);

      const staticFile = staticFiles.find((file) => `/${file.fileName}` === pathname);
      if (staticFile) {
        send(response, { status: 200, ...staticFile });
        return;
      }

      let route = routesByPath.get(pathname);
      if (!route && routesByPath.has(`${pathname}/`)) {
        response.statusCode = 301;
        response.setHeader('Location', `${pathname}/${url.search}`);
        response.end();
        return;
      }

      const wantsDocument = request.headers.accept?.includes('text/html') ?? false;
      if (!route && wantsDocument && path.extname(pathname) === '') {
        route = notFoundRoute;
      }
      if (!route) {
        next();
        return;
      }

      const document = await server.transformIndexHtml(
        pathname,
        renderRoute(route),
        request.originalUrl,
      );
      send(response, {
        status: route === notFoundRoute && pathname !== route.path ? 404 : 200,
        contentType: 'text/html',
        body: document,
      });
    } catch (error) {
      next(error);
    }
  };
}

export function staticSite(): Plugin {
  const routes = buildRoutes();
  let routesByFile = new Map<string, Route>();

  return {
    name: 'portfolio:static-site',
    enforce: 'pre',

    config(userConfig) {
      const root = path.resolve(userConfig.root ?? process.cwd());
      const input = Object.fromEntries(
        routes.map((route) => [route.id, path.join(root, route.outputFile)]),
      );
      routesByFile = new Map(
        routes.map((route) => [normalizePath(path.join(root, route.outputFile)), route]),
      );
      return { build: { rolldownOptions: { input } } };
    },

    resolveId(id) {
      const normalized = normalizePath(id);
      return routesByFile.has(normalized) ? normalized : null;
    },

    load(id) {
      const route = routesByFile.get(normalizePath(id));
      return route ? renderRoute(route) : null;
    },

    configureServer(server) {
      server.middlewares.use(createDevHandler(server, routes));
    },

    generateBundle() {
      for (const file of buildStaticFiles(routes)) {
        this.emitFile({ type: 'asset', fileName: file.fileName, source: file.body });
      }
    },
  };
}
