const glyphs = '<>/\\|_-=+*#%01ABCDEFGHJKLMNPQRSTUVWXYZ';
const frames = new WeakMap<HTMLElement, number>();

export function scramble(element: HTMLElement, text: string, duration = 520): void {
  const previous = frames.get(element);
  if (previous) {
    cancelAnimationFrame(previous);
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.textContent = text;
    return;
  }
  const from = element.textContent ?? '';
  const length = Math.max(from.length, text.length);
  const thresholds = Array.from(
    { length },
    (_, index) => 0.25 + (index / length) * 0.55 + Math.random() * 0.2,
  );
  const start = performance.now();

  const step = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    let output = '';
    for (let index = 0; index < length; index += 1) {
      const target = text[index] ?? '';
      if (t >= (thresholds[index] ?? 1)) {
        output += target;
      } else if (target === ' ') {
        output += ' ';
      } else {
        output += glyphs[Math.floor(Math.random() * glyphs.length)] ?? '';
      }
    }
    element.textContent = t >= 1 ? text : output;
    if (t < 1) {
      frames.set(element, requestAnimationFrame(step));
    } else {
      frames.delete(element);
    }
  };
  frames.set(element, requestAnimationFrame(step));
}
