interface TurnstileOptions {
  readonly sitekey: string;
  readonly theme: 'dark';
  readonly language: string;
  readonly callback: (token: string) => void;
  readonly 'expired-callback': () => void;
  readonly 'error-callback': () => void;
}

interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileOptions): string;
  reset(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const scriptUrl = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile'));
    script.onerror = () => reject(new Error('turnstile'));
    document.head.append(script);
  });
  return loading;
}

export class Verification {
  readonly #container: HTMLElement;
  readonly #siteKey: string;
  readonly #language: string;
  #widget: string | null = null;
  #api: TurnstileApi | null = null;
  #token = '';

  constructor(container: HTMLElement, siteKey: string, language: string) {
    this.#container = container;
    this.#siteKey = siteKey;
    this.#language = language;
  }

  get token(): string {
    return this.#token;
  }

  async mount(): Promise<void> {
    if (this.#widget !== null) {
      return;
    }
    this.#api = await loadTurnstile();
    this.#widget = this.#api.render(this.#container, {
      sitekey: this.#siteKey,
      theme: 'dark',
      language: this.#language,
      callback: (token) => {
        this.#token = token;
      },
      'expired-callback': () => {
        this.#token = '';
      },
      'error-callback': () => {
        this.#token = '';
      },
    });
  }

  reset(): void {
    this.#token = '';
    if (this.#api && this.#widget !== null) {
      this.#api.reset(this.#widget);
    }
  }
}
