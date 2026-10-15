export interface StageCenter {
  readonly x: number;
  readonly y: number;
}

export function measureStageCenter(scope: Document, width: number, height: number): StageCenter {
  const panel = scope.querySelector<HTMLElement>('.chapter__panel');
  if (!panel) {
    return { x: width / 2, y: height / 2 };
  }
  const top = scope.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;
  const bottom = scope.querySelector<HTMLElement>('.hud')?.offsetHeight ?? 0;
  const rail = scope.querySelector<HTMLElement>('.chapter-rail');
  const railWidth = rail && rail.offsetParent !== null ? rail.offsetWidth : 0;
  if (panel.offsetWidth >= width * 0.9) {
    return { x: width / 2, y: (top + height * 0.56) / 2 };
  }
  return {
    x: (panel.offsetWidth + width - railWidth) / 2,
    y: (top + height - bottom) / 2,
  };
}
