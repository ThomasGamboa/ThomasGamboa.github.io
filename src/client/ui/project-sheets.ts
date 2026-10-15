import { refract } from './refraction.ts';

function openSheet(sheet: HTMLDialogElement): void {
  if (sheet.open) {
    return;
  }
  sheet.showModal();
  sheet.querySelector('.project-sheet__scroll')?.scrollTo({ top: 0 });
  const title = sheet.querySelector<HTMLElement>('.project-sheet__title');
  if (title) {
    refract(title, { strength: 12, duration: 1200 });
  }
}

export function bindProjectSheets(scope: Document): void {
  for (const sheet of scope.querySelectorAll<HTMLDialogElement>('dialog[data-project-sheet]')) {
    sheet.addEventListener('click', (event) => {
      if (event.target === sheet) {
        sheet.close();
      }
    });
    for (const close of sheet.querySelectorAll<HTMLAnchorElement>('[data-sheet-close]')) {
      close.addEventListener('click', (event) => {
        event.preventDefault();
        sheet.close();
      });
    }
  }
  for (const trigger of scope.querySelectorAll<HTMLAnchorElement>('a[data-sheet-open]')) {
    const sheet = scope.getElementById(trigger.hash.slice(1));
    if (!(sheet instanceof HTMLDialogElement)) {
      continue;
    }
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openSheet(sheet);
    });
  }
}
