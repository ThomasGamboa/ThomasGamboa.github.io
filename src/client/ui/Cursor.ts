import { cursorState, lensOffset } from './cursor-state.ts';
import { scramble } from './scramble.ts';

const svgNamespace = 'http://www.w3.org/2000/svg';
const lensSeconds = 0.09;
const dotSeconds = 0.02;
const velocitySeconds = 0.05;
const interactiveSelector = 'a, button, summary, label, input, select, textarea, [role="button"]';
const surfaceSelector = '.surface';
const lensSpread = [0.9, 1, 1.1] as const;
const channelMatrices = [
  '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0',
  '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0',
  '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0',
] as const;

function lensMap(size: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) {
    return '';
  }
  const image = context.createImageData(size, size);
  const half = size / 2;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = (x + 0.5 - half) / half;
      const ny = (y + 0.5 - half) / half;
      const shift = lensOffset(Math.hypot(nx, ny));
      const offset = (y * size + x) * 4;
      image.data[offset] = Math.round(128 + nx * shift * 127);
      image.data[offset + 1] = Math.round(128 + ny * shift * 127);
      image.data[offset + 2] = 128;
      image.data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

function svgElement(name: string, values: Record<string, string>): SVGElement {
  const element = document.createElementNS(svgNamespace, name) as SVGElement;
  for (const [key, value] of Object.entries(values)) {
    element.setAttribute(key, value);
  }
  return element;
}

function createLensFilter(radius: number): SVGElement {
  const size = String(radius * 2);
  const svg = svgElement('svg', { width: '0', height: '0', 'aria-hidden': 'true' });
  svg.style.position = 'absolute';
  const filter = svgElement('filter', {
    id: 'cursor-lens',
    x: '0',
    y: '0',
    width: size,
    height: size,
    filterUnits: 'userSpaceOnUse',
    'color-interpolation-filters': 'sRGB',
  });
  filter.append(
    svgElement('feImage', {
      href: lensMap(radius * 2),
      x: '0',
      y: '0',
      width: size,
      height: size,
      preserveAspectRatio: 'none',
      result: 'lens',
    }),
  );
  lensSpread.forEach((spread, index) => {
    filter.append(
      svgElement('feDisplacementMap', {
        in: 'SourceGraphic',
        in2: 'lens',
        scale: String(Math.round(radius * 2 * spread)),
        xChannelSelector: 'R',
        yChannelSelector: 'G',
        result: `shifted-${index}`,
      }),
      svgElement('feColorMatrix', {
        in: `shifted-${index}`,
        type: 'matrix',
        values: channelMatrices[index] ?? '',
        result: `channel-${index}`,
      }),
    );
  });
  filter.append(
    svgElement('feComposite', {
      in: 'channel-0',
      in2: 'channel-1',
      operator: 'arithmetic',
      k2: '1',
      k3: '1',
      result: 'mixed',
    }),
    svgElement('feComposite', {
      in: 'mixed',
      in2: 'channel-2',
      operator: 'arithmetic',
      k2: '1',
      k3: '1',
    }),
  );
  svg.append(filter);
  return svg;
}

export class Cursor {
  readonly #root: HTMLElement;
  readonly #lens: HTMLElement;
  readonly #pin: HTMLElement;
  readonly #tag: HTMLElement;
  readonly #tagText: HTMLElement;
  readonly #sceneLabel: string;
  readonly #target = { x: 0, y: 0 };
  readonly #lensPosition = { x: 0, y: 0 };
  readonly #dotPosition = { x: 0, y: 0 };
  readonly #velocity = { x: 0, y: 0 };
  #elementLabel = '';
  #sceneHover = false;
  #shownLabel = '';
  #frame = 0;
  #lastTime = 0;
  #placed = false;

  static mount(host: HTMLElement): Cursor | null {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return finePointer && !reducedMotion ? new Cursor(host) : null;
  }

  constructor(host: HTMLElement) {
    this.#sceneLabel =
      document.querySelector<HTMLElement>('[data-experience-canvas]')?.dataset.cursor ?? '';
    this.#root = document.createElement('div');
    this.#root.className = 'cursor';
    this.#root.popover = 'manual';
    this.#root.setAttribute('aria-hidden', 'true');
    this.#root.style.setProperty('--lens-radius', `${cursorState.radius}px`);
    this.#lens = document.createElement('span');
    this.#lens.className = 'cursor__lens';
    this.#pin = document.createElement('span');
    this.#pin.className = 'cursor__pin';
    const dot = document.createElement('span');
    dot.className = 'cursor__dot';
    this.#pin.append(dot);
    this.#tag = document.createElement('span');
    this.#tag.className = 'cursor__tag';
    this.#tagText = document.createElement('span');
    this.#tagText.className = 'cursor__tag-text';
    this.#tag.append(this.#tagText);
    this.#root.append(this.#lens, this.#pin, this.#tag);
    host.append(createLensFilter(cursorState.radius), this.#root);
    this.#root.showPopover();
    new MutationObserver((records) => {
      if (records.some((record) => (record.target as HTMLDialogElement).open)) {
        this.#raise();
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
    document.addEventListener(
      'toggle',
      (event) => {
        if (event.target !== this.#root && (event as ToggleEvent).newState === 'open') {
          this.#raise();
        }
      },
      true,
    );

    window.addEventListener('pointermove', this.#onMove, { passive: true });
    document.addEventListener('pointerover', this.#onOver);
    window.addEventListener('pointerdown', () => this.#toggle('pressed', true));
    window.addEventListener('pointerup', () => this.#toggle('pressed', false));
    window.addEventListener('scene-hover', (event) => {
      this.#sceneHover = Boolean((event as CustomEvent<boolean>).detail);
      this.#updateLabel();
    });
    document.documentElement.addEventListener('pointerleave', () => {
      this.#toggle('visible', false);
      cursorState.visible = false;
    });
    document.documentElement.addEventListener('pointerenter', () => {
      this.#toggle('visible', this.#placed);
      cursorState.visible = this.#placed;
    });
  }

  #raise(): void {
    this.#root.hidePopover();
    this.#root.showPopover();
  }

  #toggle(state: 'visible' | 'hover' | 'pressed' | 'surface' | 'label', enabled: boolean): void {
    this.#root.toggleAttribute(`data-${state}`, enabled);
  }

  #updateLabel(): void {
    const sceneLabel = this.#sceneHover && !cursorState.overSurface ? this.#sceneLabel : '';
    const label = this.#elementLabel || sceneLabel;
    if (label === this.#shownLabel) {
      return;
    }
    this.#shownLabel = label;
    this.#toggle('label', label !== '');
    if (label) {
      scramble(this.#tagText, label);
    }
  }

  readonly #onMove = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') {
      return;
    }
    this.#target.x = event.clientX;
    this.#target.y = event.clientY;
    if (!this.#placed) {
      this.#placed = true;
      for (const point of [this.#lensPosition, this.#dotPosition]) {
        point.x = this.#target.x;
        point.y = this.#target.y;
      }
      this.#toggle('visible', true);
      cursorState.visible = true;
    }
    if (this.#frame === 0) {
      this.#lastTime = performance.now();
      this.#frame = requestAnimationFrame(this.#follow);
    }
  };

  readonly #onOver = (event: PointerEvent): void => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const surface = event.target.closest(surfaceSelector) !== null;
    this.#toggle('surface', surface);
    cursorState.overSurface = surface;
    this.#toggle('hover', event.target.closest(interactiveSelector) !== null);
    this.#elementLabel = event.target.closest<HTMLElement>('[data-cursor]')?.dataset.cursor ?? '';
    this.#updateLabel();
  };

  readonly #follow = (time: number): void => {
    const delta = Math.max((time - this.#lastTime) / 1000, 1 / 240);
    this.#lastTime = time;
    const lensBlend = 1 - Math.exp(-delta / lensSeconds);
    const dotBlend = 1 - Math.exp(-delta / dotSeconds);
    const previousX = this.#lensPosition.x;
    const previousY = this.#lensPosition.y;
    this.#lensPosition.x += (this.#target.x - this.#lensPosition.x) * lensBlend;
    this.#lensPosition.y += (this.#target.y - this.#lensPosition.y) * lensBlend;
    this.#dotPosition.x += (this.#target.x - this.#dotPosition.x) * dotBlend;
    this.#dotPosition.y += (this.#target.y - this.#dotPosition.y) * dotBlend;
    const velocityBlend = 1 - Math.exp(-delta / velocitySeconds);
    const rawX = (this.#lensPosition.x - previousX) / delta;
    const rawY = (this.#lensPosition.y - previousY) / delta;
    this.#velocity.x += (rawX - this.#velocity.x) * velocityBlend;
    this.#velocity.y += (rawY - this.#velocity.y) * velocityBlend;

    const distance =
      Math.abs(this.#target.x - this.#lensPosition.x) +
      Math.abs(this.#target.y - this.#lensPosition.y);
    const speed = Math.hypot(this.#velocity.x, this.#velocity.y);
    if (distance < 0.15 && speed < 8) {
      this.#lensPosition.x = this.#target.x;
      this.#lensPosition.y = this.#target.y;
      this.#dotPosition.x = this.#target.x;
      this.#dotPosition.y = this.#target.y;
      this.#velocity.x = 0;
      this.#velocity.y = 0;
      this.#frame = 0;
    } else {
      this.#frame = requestAnimationFrame(this.#follow);
    }
    this.#place();
  };

  #place(): void {
    const { x, y } = this.#lensPosition;
    const speed = Math.hypot(this.#velocity.x, this.#velocity.y);
    const angle = Math.atan2(this.#velocity.y, this.#velocity.x);
    const stretch = 1 + Math.min(speed / 2600, 0.45);
    const squash = 1 / Math.sqrt(stretch);
    this.#lens.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${angle.toFixed(3)}rad) scale(${stretch.toFixed(3)}, ${squash.toFixed(3)})`;
    this.#pin.style.transform = `translate3d(${this.#dotPosition.x.toFixed(1)}px, ${this.#dotPosition.y.toFixed(1)}px, 0)`;
    const offset = cursorState.radius * 0.72;
    this.#tag.style.transform = `translate3d(${(x + offset).toFixed(1)}px, ${(y + offset).toFixed(1)}px, 0)`;
    cursorState.x = x;
    cursorState.y = y;
    cursorState.velocityX = this.#velocity.x;
    cursorState.velocityY = this.#velocity.y;
  }
}
