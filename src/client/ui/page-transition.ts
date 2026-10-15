import { bubbleOriginKey } from '../../shared/design/transition.ts';

function isDocumentNavigation(link: HTMLAnchorElement, event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) {
    return false;
  }
  if (event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) {
    return false;
  }
  const url = new URL(link.href, window.location.href);
  return url.origin === window.location.origin && url.pathname !== window.location.pathname;
}

export function bindPageTransitions(scope: Document): void {
  scope.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!(link instanceof HTMLAnchorElement) || !isDocumentNavigation(link, event)) {
      return;
    }
    const bounds = link.getBoundingClientRect();
    const x = event.detail > 0 ? event.clientX : bounds.left + bounds.width / 2;
    const y = event.detail > 0 ? event.clientY : bounds.top + bounds.height / 2;
    try {
      sessionStorage.setItem(
        bubbleOriginKey,
        JSON.stringify({ x: x / window.innerWidth, y: y / window.innerHeight }),
      );
    } catch {}
  });
}
