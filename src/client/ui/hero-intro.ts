import { scramble } from './scramble.ts';

const letterDelay = 34;
const settleMilliseconds = 1500;
const roleDelay = 320;

function splitLetters(element: HTMLElement, text: string): void {
  const letters = document.createElement('span');
  letters.setAttribute('aria-hidden', 'true');
  let index = 0;
  text.split(/(\s+)/).forEach((part) => {
    if (part === '') {
      return;
    }
    if (/^\s+$/.test(part)) {
      letters.append(document.createTextNode(part));
      return;
    }
    const word = document.createElement('span');
    word.className = 'intro-word';
    for (const character of part) {
      const letter = document.createElement('span');
      letter.className = 'intro-letter';
      letter.textContent = character;
      letter.style.setProperty('--letter-index', String(index));
      word.append(letter);
      index += 1;
    }
    letters.append(word);
  });
  const label = document.createElement('span');
  label.className = 'visually-hidden';
  label.textContent = text;
  element.replaceChildren(label, letters);
}

export function introduceHero(title: HTMLElement): void {
  const name = title.querySelector<HTMLElement>('.hero__name');
  const role = title.querySelector<HTMLElement>('.hero__role');
  const nameText = name?.textContent ?? '';
  const roleText = role?.textContent ?? '';
  if (name) {
    splitLetters(name, nameText);
  }
  title.dataset.introState = 'enter';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      title.dataset.introState = 'play';
    });
  });
  if (role) {
    window.setTimeout(() => scramble(role, roleText, 950), roleDelay);
  }
  window.setTimeout(
    () => {
      if (name) {
        name.textContent = nameText;
      }
      delete title.dataset.introState;
    },
    nameText.length * letterDelay + settleMilliseconds,
  );
}
