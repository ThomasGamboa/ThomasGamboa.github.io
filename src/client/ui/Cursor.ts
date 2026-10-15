import { cursorState } from './cursor-state.ts';

const svgNamespace = 'http://www.w3.org/2000/svg';
const lensSeconds = 0.14;
const dotSeconds = 0.03;
const velocitySeconds = 0.06;
const interactiveSelector = 'a, button, summary, label, input, select, textarea, [role="button"]';
const surfaceSelector = '.surface';
const lensScales = [40, 50, 60] as const;

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
      const radius = Math.hypot(nx, ny);
      const dome = radius < 1 ? 1 - radius * radius : 0;
      const offset = (y * size + x) * 4;
      image.data[offset] = Math.round(128 - nx * dome * 127);
      image.data[offset + 1] = Math.round(128 - ny * dome * 127);
      image.data[offset + 2] = 128;
      image.data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

function createLensFilter(radius: number): SVGSVGElement {
  const size = radius * 2;
  const svg = document.createElementNS(svgNamespace, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  const filter = document.createElementNS(svgNamespace, 'filter');
  filter.id = 'cursor-lens';
  filter.setAttribute('x', '0');
  filter.setAttribute('y', '0');
  filter.setAttribute('width', String(size));
  filter.setAttribute('height', String(size));
  filter.setAttribute('filterUnits', 'userSpaceOnUse');
  filter.setAttribute('color-interpolation-filters', 'sRGB');
  const image = document.createElementNS(svgNamespace, 'feImage');
  image.setAttribute('href', lensMap(size));
  image.setAttribute('x', '0');
  image.setAttribute('y', '0');
  image.setAttribute('width', String(size));
  image.setAttribute('height', String(size));
  image.setAttribute('preserveAspectRatio', 'none');
  image.setAttribute('result', 'lens');
  filter.append(image);
  const matrices = [
    '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0',
    '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0',
    '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0',
  ];
  lensScales.forEach((scale, index) => {
    const map = document.createElementNS(svgNamespace, 'feDisplacementMap');
    map.setAttribute('in', 'SourceGraphic');
    map.setAttribute('in2', 'lens');
    map.setAttribute('scale', String(scale));
    map.setAttribute('xChannelSelector', 'R');
    map.setAttribute('yChannelSelector', 'G');
    map.setAttribute('result', `shifted-${index}`);
    const isolate = document.createElementNS(svgNamespace, 'feColorMatrix');
    isolate.setAttribute('in', `shifted-${index}`);
    isolate.setAttribute('type', 'matrix');
    isolate.setAttribute('values', matrices[index] ?? '');
    isolate.setAttribute('result', `channel-${index}`);
    filter.append(map, isolate);
  });
  const mix = document.createElementNS(svgNamespace, 'feComposite');
  mix.setAttribute('in', 'channel-0');
  mix.setAttribute('in2', 'channel-1');
  mix.setAttribute('operator', 'arithmetic');
  mix.setAttribute('k2', '1');
  mix.setAttribute('k3', '1');
  mix.setAttribute('result', 'mixed');
  const final = document.createElementNS(svgNamespace, 'feComposite');
  final.setAttribute('in', 'mixed');
  final.setAttribute('in2', 'channel-2');
  final.setAttribute('operator', 'arithmetic');
  final.setAttribute('k2', '1');
  final.setAttribute('k3', '1');
  filter.append(mix, final);
  svg.append(filter);
  return svg;
}

export class Cursor {
  readonly #root: HTMLElement;
  readonly #lens: HTMLElement;
  readonly #dot: HTMLElement;
  readonly #target = { x: 0, y: 0 };
  readonly #lensPosition = { x: 0, y: 0 };
  readonly #dotPosition = { x: 0, y: 0 };
  readonly #velocity = { x: 0, y: 0 };
  #frame = 0;
  #lastTime = 0;
  #placed = false;

  static mount(host: HTMLElement): Cursor | null {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return finePointer && !reducedMotion ? new Cursor(host) : null;
  }

  constructor(host: HTMLElement) {
    this.#root = document.createElement('div');
    this.#root.className = 'cursor';
    this.#root.setAttribute('aria-hidden', 'true');
    this.#root.style.setProperty('--lens-radius', `${cursorState.radius}px`);
    this.#lens = document.createElement('span');
    this.#lens.className = 'cursor__lens';
    this.#dot = document.createElement('span');
    this.#dot.className = 'cursor__dot';
    this.#root.append(this.#lens, this.#dot);
    host.append(createLensFilter(cursorState.radius), this.#root);

    window.addEventListener('pointermove', this.#onMove, { passive: true });
    document.addEventListener('pointerover', this.#onOver);
    window.addEventListener('pointerdown', () => this.#toggle('pressed', true));
    window.addEventListener('pointerup', () => this.#toggle('pressed', false));
    document.documentElement.addEventListener('pointerleave', () => {
      this.#toggle('visible', false);
      cursorState.visible = false;
    });
    document.documentElement.addEventListener('pointerenter', () => {
      this.#toggle('visible', this.#placed);
      cursorState.visible = this.#placed;
    });
  }

  #toggle(state: 'visible' | 'hover' | 'pressed' | 'surface', enabled: boolean): void {
    this.#root.toggleAttribute(`data-${state}`, enabled);
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
    this.#velocity.x +=
      ((this.#lensPosition.x - previousX) / delta - this.#velocity.x) * velocityBlend;
    this.#velocity.y +=
      ((this.#lensPosition.y - previousY) / delta - this.#velocity.y) * velocityBlend;
    this.#place();

    const distance =
      Math.abs(this.#target.x - this.#lensPosition.x) +
      Math.abs(this.#target.y - this.#lensPosition.y) +
      Math.abs(this.#velocity.x) * 0.01 +
      Math.abs(this.#velocity.y) * 0.01;
    this.#frame = distance > 0.2 ? requestAnimationFrame(this.#follow) : 0;
    if (this.#frame === 0) {
      this.#velocity.x = 0;
      this.#velocity.y = 0;
      this.#place();
    }
  };

  #place(): void {
    const { x, y } = this.#lensPosition;
    const speed = Math.hypot(this.#velocity.x, this.#velocity.y);
    const angle = Math.atan2(this.#velocity.y, this.#velocity.x);
    const stretch = 1 + Math.min(speed / 2200, 0.55);
    this.#lens.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${angle.toFixed(3)}rad) scale(${stretch.toFixed(3)}, ${(1 / Math.sqrt(stretch)).toFixed(3)})`;
    this.#dot.style.transform = `translate3d(${this.#dotPosition.x.toFixed(1)}px, ${this.#dotPosition.y.toFixed(1)}px, 0)`;
    cursorState.x = x;
    cursorState.y = y;
    cursorState.velocityX = this.#velocity.x;
    cursorState.velocityY = this.#velocity.y;
  }
}
