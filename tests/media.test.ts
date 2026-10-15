import { beforeAll, describe, expect, it } from 'vitest';
import type { ContentBlock } from '../src/content/types.ts';
import { renderContentBlocks } from '../src/site/components/content-blocks.ts';
import { mediaLibrary } from '../src/site/media.ts';

const cover = {
  src: 'projects/apparte/cover.png',
  alt: { es: 'Portada de prueba', en: 'Test cover' },
};

beforeAll(async () => {
  await mediaLibrary.scan(process.cwd());
});

describe('media library', () => {
  it('renders responsive pictures with intrinsic dimensions', () => {
    const markup = mediaLibrary.picture(cover, 'es', { sizes: '100vw' }).value;
    expect(markup).toContain('type="image/avif"');
    expect(markup).toContain('type="image/webp"');
    expect(markup).toMatch(/width="1080" height="1080"/);
    expect(markup).toContain('alt="Portada de prueba"');
    expect(markup).toContain('loading="lazy"');
    expect(markup).not.toMatch(/-2048\./);
  });

  it('adds an animated source only when motion is allowed', () => {
    const markup = mediaLibrary.picture(
      { src: 'projects/apangora/01.webp', alt: cover.alt },
      'es',
      { sizes: '100vw' },
    ).value;
    expect(markup).toContain('media="(prefers-reduced-motion: no-preference)"');
    expect(markup).toMatch(/-motion\.webp 960w/);
    expect(markup).toMatch(/type="image\/avif"/);
  });

  it('fails loudly for missing media', () => {
    expect(() =>
      mediaLibrary.picture({ src: 'missing.png', alt: cover.alt }, 'es', { sizes: '100vw' }),
    ).toThrow(/missing\.png/);
  });

  it('encodes variants on demand', async () => {
    const variant = mediaLibrary.usedVariants.find((candidate) => candidate.format === 'webp');
    expect(variant).toBeDefined();
    if (variant) {
      const buffer = await mediaLibrary.render(variant, 'node_modules/.cache/media');
      expect(buffer.subarray(8, 12).toString('ascii')).toBe('WEBP');
    }
  });
});

describe('content blocks', () => {
  const blocks: ContentBlock[] = [
    { type: 'media', image: cover, layout: 'wide', caption: { es: 'Pie', en: 'Caption' } },
    { type: 'gallery', items: [cover, cover] },
    {
      type: 'video',
      provider: 'youtube',
      id: 'abc123',
      title: { es: 'Tráiler', en: 'Trailer' },
      poster: cover,
    },
    {
      type: 'process',
      heading: { es: 'Proceso', en: 'Process' },
      steps: [{ title: { es: 'Idea', en: 'Idea' }, body: { es: 'Bocetos', en: 'Sketches' } }],
    },
  ];

  it('renders every block type with accessible hooks', () => {
    const markup = renderContentBlocks(blocks, 'en').value;
    expect(markup).toContain('<figcaption>Caption</figcaption>');
    expect(markup.match(/data-gallery-index=/g)).toHaveLength(2);
    expect(markup).toContain('data-video-embed="https://www.youtube-nocookie.com/embed/abc123');
    expect(markup).toContain('Play video: Trailer');
    expect(markup).toContain('<h3>Idea</h3>');
  });
});
