import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { MediaReference } from '../content/types.ts';
import type { Locale } from '../shared/i18n/locales.ts';
import { attributes, html, type SafeHtml } from './html.ts';

export const mediaDirectory = 'src/assets/media';
export const mediaPublicPrefix = 'media';

const widths = [480, 960, 1440, 2048] as const;
const motionWidths = [480, 960] as const;
const pixelArtWidth = 512;
const formats = ['avif', 'webp'] as const;
const supported = new Set(['.png', '.jpg', '.jpeg', '.webp']);

type Format = (typeof formats)[number] | 'motion';

interface MediaSource {
  readonly key: string;
  readonly file: string;
  readonly width: number;
  readonly height: number;
  readonly frames: number;
  readonly hash: string;
}

export interface MediaVariant {
  readonly source: MediaSource;
  readonly width: number;
  readonly format: Format;
  readonly fileName: string;
}

export interface ImageOptions {
  readonly sizes: string;
  readonly className?: string;
  readonly eager?: boolean;
}

function slugify(key: string): string {
  return key
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase();
}

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(full) : Promise.resolve([full]);
    }),
  );
  return nested.flat();
}

export class MediaLibrary {
  readonly #sources = new Map<string, MediaSource>();
  readonly #variants = new Map<string, MediaVariant>();
  readonly #used = new Set<string>();
  #root = '';
  #scanned: Promise<void> | null = null;

  scan(root: string): Promise<void> {
    this.#root = root;
    this.#scanned ??= this.#scan();
    return this.#scanned;
  }

  get usedVariants(): MediaVariant[] {
    return [...this.#used].flatMap((name) => {
      const variant = this.#variants.get(name);
      return variant ? [variant] : [];
    });
  }

  variant(fileName: string): MediaVariant | undefined {
    return this.#variants.get(fileName);
  }

  picture(reference: MediaReference, locale: Locale, options: ImageOptions): SafeHtml {
    const source = this.#sources.get(reference.src);
    if (!source) {
      throw new Error(`Media "${reference.src}" not found in ${mediaDirectory}`);
    }
    const sets = formats.map((format) => {
      const variants = this.#variantsFor(source, format);
      return variants.map((variant) => `/${variant.fileName} ${variant.width}w`).join(', ');
    });
    const fallback = this.#variantsFor(source, 'webp').at(-1);
    const motion =
      source.frames > 1
        ? this.#motionVariantsFor(source)
            .map((variant) => `/${variant.fileName} ${variant.width}w`)
            .join(', ')
        : null;
    return html`<picture${attributes({ class: options.className })}>
  ${motion ? html`<source type="image/webp" media="(prefers-reduced-motion: no-preference)" srcset="${motion}" sizes="${options.sizes}">` : null}
  <source type="image/avif" srcset="${sets[0] ?? ''}" sizes="${options.sizes}">
  <source type="image/webp" srcset="${sets[1] ?? ''}" sizes="${options.sizes}">
  <img${attributes({
    src: fallback ? `/${fallback.fileName}` : '',
    alt: reference.alt[locale],
    width: source.width,
    height: source.height,
    loading: options.eager ? 'eager' : 'lazy',
    decoding: 'async',
    sizes: options.sizes,
    'data-pixel': source.width <= pixelArtWidth,
  })}>
</picture>`;
  }

  async render(variant: MediaVariant, cacheDirectory: string): Promise<Buffer> {
    const cached = path.join(cacheDirectory, variant.fileName.replaceAll('/', '_'));
    const existing = await readFile(cached).catch(() => null);
    if (existing) {
      return existing;
    }
    const { source } = variant;
    const animated = variant.format === 'motion';
    const pipeline = sharp(source.file, {
      animated,
      page: animated ? 0 : Math.floor(source.frames / 2),
      limitInputPixels: false,
    }).resize({
      width: variant.width,
      withoutEnlargement: true,
    });
    const output =
      variant.format === 'avif'
        ? await pipeline.avif({ quality: 52, effort: 4 }).toBuffer()
        : await pipeline.webp({ quality: animated ? 64 : 78, effort: 4, loop: 0 }).toBuffer();
    await mkdir(cacheDirectory, { recursive: true });
    await writeFile(cached, output);
    return output;
  }

  #variantsFor(source: MediaSource, format: Format): MediaVariant[] {
    const candidates = widths.filter((width) => width < source.width);
    const chosen = [...candidates, Math.min(source.width, widths.at(-1) ?? source.width)];
    return [...new Set(chosen)].map((width) => {
      const fileName = `${mediaPublicPrefix}/${slugify(source.key)}-${source.hash}-${width}.${format}`;
      const variant = this.#variants.get(fileName) ?? { source, width, format, fileName };
      this.#variants.set(fileName, variant);
      this.#used.add(fileName);
      return variant;
    });
  }

  #motionVariantsFor(source: MediaSource): MediaVariant[] {
    const largest = Math.min(source.width, motionWidths.at(-1) ?? source.width);
    const chosen = [...motionWidths.filter((width) => width < largest), largest];
    return [...new Set(chosen)].map((width) => {
      const fileName = `${mediaPublicPrefix}/${slugify(source.key)}-${source.hash}-${width}-motion.webp`;
      const variant = this.#variants.get(fileName) ?? { source, width, format: 'motion', fileName };
      this.#variants.set(fileName, variant);
      this.#used.add(fileName);
      return variant;
    });
  }

  async #scan(): Promise<void> {
    const directory = path.join(this.#root, mediaDirectory);
    const files = (await listFiles(directory)).filter((file) =>
      supported.has(path.extname(file).toLowerCase()),
    );
    await Promise.all(
      files.map(async (file) => {
        const buffer = await readFile(file);
        const metadata = await sharp(buffer).metadata();
        const key = path.relative(directory, file).split(path.sep).join('/');
        this.#sources.set(key, {
          key,
          file,
          width: metadata.width ?? 0,
          height: metadata.pageHeight ?? metadata.height ?? 0,
          frames: metadata.pages ?? 1,
          hash: createHash('sha1').update(buffer).digest('hex').slice(0, 8),
        });
      }),
    );
  }
}

export const mediaLibrary = new MediaLibrary();
