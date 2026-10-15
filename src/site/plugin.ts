import type { ServerResponse } from 'node:http';
import path from 'node:path';
import { type Connect, normalizePath, type Plugin, type ViteDevServer } from 'vite';
import { palette } from '../shared/design/palette.ts';
import { renderFavicon } from './brand.ts';
import { resolveHiringConfig } from './hiring-config.ts';
import { mediaLibrary, mediaPublicPrefix } from './media.ts';
import { renderRoute } from './render.ts';
import { buildRoutes, type Route } from './routes.ts';
import { iconFiles, renderWebManifest } from './seo/icons.ts';
import { renderRobots, renderSitemap } from './seo/indexing.ts';
import { injectSecurityPolicy } from './seo/security.ts';

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

const mediaTypes: Readonly<Record<string, string>> = {
  avif: 'image/avif',
  webp: 'image/webp',
};

function buildStaticFiles(routes: readonly Route[]): readonly StaticFile[] {
  return [
    { fileName: 'sitemap.xml', contentType: 'application/xml', body: renderSitemap(routes) },
    { fileName: 'robots.txt', contentType: 'text/plain', body: renderRobots() },
    { fileName: 'favicon.svg', contentType: 'image/svg+xml', body: renderFavicon(palette.signal) },
    {
      fileName: 'site.webmanifest',
      contentType: 'application/manifest+json',
      body: renderWebManifest(),
    },
  ];
}

function send(response: ServerResponse, { status, contentType, body }: TextResponse): void {
  response.statusCode = status;
  response.setHeader('Content-Type', `${contentType}; charset=utf-8`);
  response.end(body);
}

function createDevHandler(
  server: ViteDevServer,
  routes: readonly Route[],
  root: string,
  cacheDirectory: string,
) {
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
      await mediaLibrary.scan(root);
      const url = new URL(request.url ?? '/', 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);

      const staticFile = staticFiles.find((file) => `/${file.fileName}` === pathname);
      if (staticFile) {
        send(response, { status: 200, ...staticFile });
        return;
      }

      const icon = iconFiles.find((file) => `/${file.fileName}` === pathname);
      if (icon) {
        response.statusCode = 200;
        response.setHeader('Content-Type', icon.contentType);
        response.end(await icon.render());
        return;
      }

      if (pathname.startsWith(`/${mediaPublicPrefix}/`)) {
        const variant = mediaLibrary.variant(pathname.slice(1));
        if (!variant) {
          next();
          return;
        }
        response.statusCode = 200;
        response.setHeader(
          'Content-Type',
          mediaTypes[variant.format] ?? 'application/octet-stream',
        );
        response.end(await mediaLibrary.render(variant, cacheDirectory));
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
  let root = process.cwd();
  let cacheDirectory = path.join(root, 'node_modules/.cache/media');

  return {
    name: 'portfolio:static-site',
    enforce: 'pre',

    config(userConfig) {
      root = path.resolve(userConfig.root ?? process.cwd());
      cacheDirectory = path.join(root, 'node_modules/.cache/media');
      const input = Object.fromEntries(
        routes.map((route) => [route.id, path.join(root, route.outputFile)]),
      );
      routesByFile = new Map(
        routes.map((route) => [normalizePath(path.join(root, route.outputFile)), route]),
      );
      return { build: { rolldownOptions: { input } } };
    },

    async buildStart() {
      await mediaLibrary.scan(root);
    },

    resolveId(id) {
      const normalized = normalizePath(id);
      return routesByFile.has(normalized) ? normalized : null;
    },

    load(id) {
      const route = routesByFile.get(normalizePath(id));
      return route ? renderRoute(route) : null;
    },

    transformIndexHtml: {
      order: 'post',
      handler(document, context) {
        return context.server
          ? document
          : injectSecurityPolicy(document, resolveHiringConfig().endpoint);
      },
    },

    configureServer(server) {
      server.middlewares.use(createDevHandler(server, routes, root, cacheDirectory));
    },

    async generateBundle() {
      for (const file of buildStaticFiles(routes)) {
        this.emitFile({ type: 'asset', fileName: file.fileName, source: file.body });
      }
      for (const icon of iconFiles) {
        this.emitFile({ type: 'asset', fileName: icon.fileName, source: await icon.render() });
      }
      const variants = mediaLibrary.usedVariants;
      const outputs = await Promise.all(
        variants.map((variant) => mediaLibrary.render(variant, cacheDirectory)),
      );
      variants.forEach((variant, index) => {
        const source = outputs[index];
        if (source) {
          this.emitFile({ type: 'asset', fileName: variant.fileName, source });
        }
      });
    },
  };
}
