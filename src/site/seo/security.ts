import { createHash } from 'node:crypto';

const inlineScripts =
  /<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g;

function origin(url: string | null): string[] {
  if (!url) {
    return [];
  }
  try {
    return [new URL(url).origin];
  } catch {
    return [];
  }
}

export function contentSecurityPolicy(document: string, endpoint: string | null): string {
  const hashes = [...document.matchAll(inlineScripts)].map(
    ([, body]) =>
      `'sha256-${createHash('sha256')
        .update(body ?? '')
        .digest('base64')}'`,
  );
  const challenge = 'https://challenges.cloudflare.com';
  const directives: Record<string, readonly string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'wasm-unsafe-eval'", challenge, ...hashes],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", challenge, ...origin(endpoint)],
    'frame-src': [challenge, 'https://www.youtube-nocookie.com', 'https://player.vimeo.com'],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'", ...origin(endpoint)],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');
}

export function injectSecurityPolicy(document: string, endpoint: string | null): string {
  const policy = contentSecurityPolicy(document, endpoint);
  return document.replace(
    '<meta charset="utf-8">',
    `<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="${policy}">`,
  );
}
