import sharp from 'sharp';
import { profile } from '../../content/profile.ts';
import { site } from '../../content/site.ts';
import { palette } from '../../shared/design/palette.ts';
import { renderMarkSvg } from '../brand.ts';

export interface BinaryFile {
  readonly fileName: string;
  readonly contentType: string;
  readonly render: () => Promise<Buffer>;
}

function iconSvg(size: number, coverage: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${palette.void}"/>${renderMarkSvg(palette.signal, size, coverage)}</svg>`;
}

const faviconSizes = [16, 32, 48] as const;
const faviconCoverage = 0.72;

function rasterize(size: number, coverage: number): () => Promise<Buffer> {
  return () =>
    sharp(Buffer.from(iconSvg(size, coverage)))
      .png()
      .toBuffer();
}

function encodeIco(images: readonly { size: number; png: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size % 256, 0);
    entry.writeUInt8(size % 256, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((image) => image.png)]);
}

async function renderFaviconIco(): Promise<Buffer> {
  const images = await Promise.all(
    faviconSizes.map(async (size) => ({ size, png: await rasterize(size, faviconCoverage)() })),
  );
  return encodeIco(images);
}

export const iconFiles: readonly BinaryFile[] = [
  { fileName: 'favicon.ico', contentType: 'image/x-icon', render: renderFaviconIco },
  {
    fileName: 'icons/favicon-96.png',
    contentType: 'image/png',
    render: rasterize(96, faviconCoverage),
  },
  { fileName: 'apple-touch-icon.png', contentType: 'image/png', render: rasterize(180, 0.62) },
  { fileName: 'icons/icon-192.png', contentType: 'image/png', render: rasterize(192, 0.62) },
  { fileName: 'icons/icon-512.png', contentType: 'image/png', render: rasterize(512, 0.62) },
  { fileName: 'icons/maskable-512.png', contentType: 'image/png', render: rasterize(512, 0.48) },
];

export function renderWebManifest(): string {
  return `${JSON.stringify(
    {
      name: `${site.name} — ${profile.role.es}`,
      short_name: site.name,
      lang: 'es',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: palette.void,
      theme_color: site.themeColor,
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        {
          src: '/icons/maskable-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    null,
    2,
  )}\n`;
}
