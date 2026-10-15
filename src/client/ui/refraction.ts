const svgNamespace = 'http://www.w3.org/2000/svg';
const poolSize = 6;
const channels = [
  { matrix: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', weight: -1 },
  { matrix: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', weight: 0.3 },
  { matrix: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', weight: 1 },
] as const;

interface RefractionOptions {
  readonly strength?: number;
  readonly duration?: number;
}

interface Slot {
  readonly id: string;
  readonly turbulence: SVGFETurbulenceElement;
  readonly maps: readonly SVGFEDisplacementMapElement[];
  element: HTMLElement | null;
  frame: number;
  started: number;
}

const slots: Slot[] = [];
const active = new WeakMap<HTMLElement, Slot>();
let reducedMotion = false;

function create<K extends keyof SVGElementTagNameMap>(
  name: K,
  values: Record<string, string>,
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(svgNamespace, name);
  for (const [key, value] of Object.entries(values)) {
    element.setAttribute(key, value);
  }
  return element;
}

function buildPool(): void {
  const svg = create('svg', {
    width: '0',
    height: '0',
    'aria-hidden': 'true',
    focusable: 'false',
    class: 'refraction-filters',
  });
  svg.style.position = 'absolute';
  for (let index = 0; index < poolSize; index += 1) {
    const id = `refraction-${index}`;
    const filter = create('filter', {
      id,
      x: '-8%',
      y: '-30%',
      width: '116%',
      height: '160%',
      'color-interpolation-filters': 'sRGB',
    });
    const turbulence = create('feTurbulence', {
      type: 'fractalNoise',
      baseFrequency: '0.006 0.04',
      numOctaves: '2',
      seed: String(index * 7 + 3),
      result: 'noise',
    });
    filter.append(turbulence);
    const maps = channels.map((channel, channelIndex) => {
      const map = create('feDisplacementMap', {
        in: 'SourceGraphic',
        in2: 'noise',
        scale: '0',
        xChannelSelector: 'R',
        yChannelSelector: 'G',
        result: `shifted-${channelIndex}`,
      });
      const isolate = create('feColorMatrix', {
        in: `shifted-${channelIndex}`,
        type: 'matrix',
        values: channel.matrix,
        result: `channel-${channelIndex}`,
      });
      filter.append(map, isolate);
      return map;
    });
    filter.append(
      create('feComposite', {
        in: 'channel-0',
        in2: 'channel-1',
        operator: 'arithmetic',
        k2: '1',
        k3: '1',
        result: 'mixed',
      }),
      create('feComposite', {
        in: 'mixed',
        in2: 'channel-2',
        operator: 'arithmetic',
        k2: '1',
        k3: '1',
      }),
    );
    svg.append(filter);
    slots.push({ id, turbulence, maps, element: null, frame: 0, started: 0 });
  }
  document.body.append(svg);
}

function release(slot: Slot): void {
  cancelAnimationFrame(slot.frame);
  if (slot.element) {
    slot.element.style.removeProperty('filter');
    active.delete(slot.element);
  }
  slot.element = null;
  slot.frame = 0;
}

function acquire(element: HTMLElement): Slot | undefined {
  const current = active.get(element);
  if (current) {
    return current;
  }
  const free = slots.find((slot) => slot.element === null);
  const slot =
    free ?? slots.reduce((oldest, slot) => (slot.started < oldest.started ? slot : oldest));
  if (!slot) {
    return undefined;
  }
  release(slot);
  slot.element = element;
  active.set(element, slot);
  element.style.filter = `url("#${slot.id}")`;
  return slot;
}

export function refract(element: HTMLElement, options: RefractionOptions = {}): void {
  if (reducedMotion || slots.length === 0) {
    return;
  }
  const strength = options.strength ?? 9;
  const duration = options.duration ?? 900;
  const slot = acquire(element);
  if (!slot) {
    return;
  }
  cancelAnimationFrame(slot.frame);
  slot.started = performance.now();
  const drift = Math.random() * 0.004;

  const step = (now: number) => {
    const t = Math.min((now - slot.started) / duration, 1);
    const envelope = (1 - t) * (1 - t);
    const wobble = 0.65 + 0.35 * Math.sin(t * Math.PI * 4);
    const amount = strength * envelope * wobble;
    slot.maps.forEach((map, index) => {
      map.setAttribute('scale', (amount * (channels[index]?.weight ?? 1)).toFixed(2));
    });
    slot.turbulence.setAttribute(
      'baseFrequency',
      `${(0.006 + drift + t * 0.004).toFixed(4)} ${(0.04 - t * 0.012).toFixed(4)}`,
    );
    if (t < 1) {
      slot.frame = requestAnimationFrame(step);
    } else {
      release(slot);
    }
  };
  slot.frame = requestAnimationFrame(step);
}

const hoverSelector = 'a, button, [data-tooltip], .service-option, summary';

export function bindRefraction(scope: Document): void {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    return;
  }
  buildPool();
  scope.addEventListener('pointerover', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const target = event.target.closest<HTMLElement>(hoverSelector);
    if (!target) {
      return;
    }
    const from = event.relatedTarget instanceof Node ? event.relatedTarget : null;
    if (from && target.contains(from)) {
      return;
    }
    refract(target, { strength: 6, duration: 650 });
  });
}
