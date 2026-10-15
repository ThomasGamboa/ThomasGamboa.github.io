function createButton(className: string, label: string, text: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  button.textContent = text;
  return button;
}

function bindGallery(gallery: HTMLElement): void {
  const triggers = [...gallery.querySelectorAll<HTMLButtonElement>('[data-gallery-index]')];
  if (triggers.length === 0) {
    return;
  }
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  const stage = document.createElement('div');
  stage.className = 'lightbox__stage';
  const counter = document.createElement('p');
  counter.className = 'lightbox__counter';
  const close = createButton('lightbox__close', gallery.dataset.labelClose ?? 'Close', '×');
  const previous = createButton(
    'lightbox__previous',
    gallery.dataset.labelPrevious ?? 'Previous',
    '←',
  );
  const next = createButton('lightbox__next', gallery.dataset.labelNext ?? 'Next', '→');
  dialog.append(stage, counter, previous, next, close);
  document.body.append(dialog);

  let current = 0;
  const show = (index: number) => {
    current = (index + triggers.length) % triggers.length;
    const picture = triggers[current]?.querySelector('picture');
    stage.replaceChildren(picture ? (picture.cloneNode(true) as HTMLElement) : '');
    const image = stage.querySelector('img');
    image?.setAttribute('sizes', '100vw');
    image?.setAttribute('loading', 'eager');
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(triggers.length).padStart(2, '0')}`;
  };

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => {
      show(index);
      dialog.showModal();
    });
  });
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      show(current - 1);
    } else if (event.key === 'ArrowRight') {
      show(current + 1);
    }
  });
  dialog.addEventListener('close', () => triggers[current]?.focus());
}

function bindVideo(container: HTMLElement): void {
  const button = container.querySelector<HTMLButtonElement>('.video__play');
  const source = container.dataset.videoEmbed;
  if (!button || !source) {
    return;
  }
  button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = source;
    frame.title = container.dataset.videoTitle ?? '';
    frame.allow = 'autoplay; fullscreen; picture-in-picture';
    frame.allowFullscreen = true;
    frame.loading = 'lazy';
    container.replaceChildren(frame);
    container.dataset.state = 'playing';
  });
}

export function bindMedia(scope: ParentNode): void {
  for (const gallery of scope.querySelectorAll<HTMLElement>('[data-gallery]')) {
    bindGallery(gallery);
  }
  for (const video of scope.querySelectorAll<HTMLElement>('[data-video-embed]')) {
    bindVideo(video);
  }
}
