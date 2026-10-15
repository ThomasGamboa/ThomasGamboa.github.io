import {
  type HireErrorCode,
  type HireFieldId,
  hireCopy,
  hireErrors,
  hireFields,
  hireSteps,
} from '../../content/hiring.ts';
import { ui } from '../../content/ui.ts';
import { summarizePricing } from '../../shared/hiring/pricing.ts';
import {
  fieldById,
  type HireRequest,
  isFieldActive,
  normalizeHireRequest,
} from '../../shared/hiring/request.ts';
import { type HireError, validateHireRequest } from '../../shared/hiring/validation.ts';
import { formatPrice } from '../../shared/i18n/format.ts';
import { isLocale, type Locale } from '../../shared/i18n/locales.ts';
import { Verification } from './turnstile.ts';

const draftKey = 'hire-request-draft';
const listFields = new Set<HireFieldId>(['services', 'addons', 'platforms']);

function element<T extends HTMLElement>(scope: ParentNode, selector: string): T | null {
  return scope.querySelector<T>(selector);
}

export class HireForm {
  readonly #form: HTMLFormElement;
  readonly #locale: Locale;
  readonly #endpoint: string | null;
  readonly #steps: readonly HTMLFieldSetElement[];
  readonly #previous: HTMLButtonElement | null;
  readonly #next: HTMLButtonElement | null;
  readonly #submit: HTMLButtonElement | null;
  readonly #status: HTMLElement | null;
  readonly #verification: Verification | null;
  readonly #startedAt = Date.now();
  #current = 0;
  #sending = false;

  constructor(form: HTMLFormElement) {
    this.#form = form;
    const locale = form.dataset.locale ?? 'es';
    this.#locale = isLocale(locale) ? locale : 'es';
    this.#endpoint = form.dataset.endpoint ?? null;
    this.#steps = [...form.querySelectorAll<HTMLFieldSetElement>('[data-step]')];
    this.#previous = element(form, '[data-hire-previous]');
    this.#next = element(form, '[data-hire-next]');
    this.#submit = element(form, '[data-hire-submit]');
    this.#status = element(form, '[data-hire-status]');
    const container = element(form, '[data-hire-verification]');
    const siteKey = form.dataset.siteKey;
    this.#verification =
      container && siteKey ? new Verification(container, siteKey, this.#locale) : null;

    form.dataset.enhanced = 'true';
    this.#restoreDraft();
    this.#syncConditionalFields();
    this.#showStep(0, false);

    form.addEventListener('change', this.#onChange);
    form.addEventListener('input', this.#saveDraft);
    form.addEventListener('submit', this.#onSubmit);
    this.#previous?.addEventListener('click', () => this.#showStep(this.#current - 1));
    this.#next?.addEventListener('click', () => this.#advance());
    form.querySelector('[data-add-service]')?.addEventListener('click', this.#addDesignService);
  }

  #read(): HireRequest {
    const data = new FormData(this.#form);
    const raw: Record<string, unknown> = { locale: this.#locale };
    for (const field of hireFields) {
      if (listFields.has(field.id)) {
        raw[field.id] = data.getAll(field.id).map(String);
      } else if (field.kind === 'checkbox') {
        raw[field.id] = data.get(field.id) === 'true';
      } else {
        raw[field.id] = String(data.get(field.id) ?? '');
      }
    }
    return normalizeHireRequest(raw);
  }

  #controls(id: HireFieldId): HTMLInputElement[] {
    return [
      ...this.#form.querySelectorAll<HTMLInputElement>(
        `[name="${id}"]:is(input, select, textarea)`,
      ),
    ];
  }

  #syncConditionalFields(): void {
    const { services } = this.#read();
    for (const container of this.#form.querySelectorAll<HTMLElement>('[data-when-services]')) {
      const id = container.dataset.field as HireFieldId | undefined;
      const active = id ? isFieldActive(fieldById(id), services) : true;
      container.toggleAttribute('data-active', active);
      for (const control of container.querySelectorAll<HTMLInputElement>(
        'input, select, textarea',
      )) {
        control.disabled = !active;
      }
    }
    this.#syncBudgetNotice();
  }

  #syncBudgetNotice(): void {
    const notice = element(this.#form, '[data-budget-notice]');
    if (notice) {
      notice.hidden = !summarizePricing(this.#read()).budgetBelowStart;
    }
  }

  #showStep(index: number, focus = true): void {
    this.#current = Math.min(Math.max(index, 0), this.#steps.length - 1);
    this.#steps.forEach((step, stepIndex) => {
      step.hidden = stepIndex !== this.#current;
    });
    const stepId = this.#steps[this.#current]?.dataset.step;
    for (const item of this.#form.querySelectorAll<HTMLElement>('[data-progress-step]')) {
      const position = hireSteps.findIndex((step) => step.id === item.dataset.progressStep);
      item.dataset.state =
        position < this.#current ? 'done' : position === this.#current ? 'current' : 'pending';
    }
    const last = this.#current === this.#steps.length - 1;
    if (this.#previous) {
      this.#previous.hidden = this.#current === 0;
    }
    if (this.#next) {
      this.#next.hidden = last;
    }
    if (this.#submit) {
      this.#submit.hidden = !last;
      this.#submit.disabled = !this.#endpoint;
    }
    if (stepId === 'review') {
      this.#renderSummary();
      void this.#verification?.mount().catch(() => this.#setStatus(hireCopy.failure[this.#locale]));
    }
    if (focus) {
      const legend = this.#steps[this.#current]?.querySelector<HTMLElement>('legend');
      legend?.setAttribute('tabindex', '-1');
      legend?.focus();
      this.#form.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }

  #stepErrors(index: number): HireError[] {
    const fields = hireSteps[index]?.fields ?? [];
    return validateHireRequest(this.#read(), fields);
  }

  #advance(): void {
    const errors = this.#stepErrors(this.#current);
    this.#renderErrors(errors, hireSteps[this.#current]?.fields ?? []);
    if (errors.length === 0) {
      this.#showStep(this.#current + 1);
    }
  }

  #renderErrors(errors: readonly HireError[], scope: readonly HireFieldId[]): void {
    for (const id of scope) {
      const error = errors.find((candidate) => candidate.field === id);
      const message = element(this.#form, `[data-error-for="${id}"]`);
      if (message) {
        message.textContent = error ? hireErrors[error.code as HireErrorCode][this.#locale] : '';
      }
      for (const control of this.#controls(id)) {
        control.toggleAttribute('aria-invalid', Boolean(error));
      }
      if (id === 'designStatus') {
        const action = element<HTMLButtonElement>(this.#form, '[data-add-service]');
        if (action) {
          action.hidden = error?.code !== 'design-required';
        }
      }
    }
    const first = errors[0];
    if (first) {
      this.#controls(first.field)[0]?.focus();
    }
  }

  #renderSummary(): void {
    const container = element(this.#form, '[data-hire-summary]');
    if (!container) {
      return;
    }
    const locale = this.#locale;
    const request = this.#read();
    const pricing = summarizePricing(request);
    const fragment = document.createDocumentFragment();

    const addList = (title: string, rows: readonly [string, string][]) => {
      const section = document.createElement('section');
      section.className = 'hire-summary__section';
      const heading = document.createElement('h3');
      heading.textContent = title;
      const list = document.createElement('dl');
      for (const [label, value] of rows) {
        const term = document.createElement('dt');
        term.textContent = label;
        const detail = document.createElement('dd');
        detail.textContent = value;
        list.append(term, detail);
      }
      section.append(heading, list);
      fragment.append(section);
    };

    const price = (amount: { amount: number; currency: 'USD' } | null) =>
      amount ? `${ui.priceFrom[locale]} ${formatPrice(amount, locale)}` : ui.priceOnRequest[locale];
    addList(hireCopy.summaryServices[locale], [
      ...pricing.services.map((service): [string, string] => [
        service.name[locale],
        price(service.startingPrice),
      ]),
      ...pricing.addons.map((service): [string, string] => [
        `${hireCopy.summaryAddons[locale]} · ${service.name[locale]}`,
        price(service.startingPrice),
      ]),
      [hireCopy.summaryTotal[locale], price(pricing.startingTotal)],
    ]);

    for (const step of hireSteps) {
      if (step.id === 'services' || step.fields.length === 0) {
        continue;
      }
      const rows = step.fields
        .map((id) => fieldById(id))
        .filter((field) => isFieldActive(field, request.services))
        .map((field): [string, string] => {
          const value = request[field.id];
          const values =
            typeof value === 'boolean'
              ? [value ? '✓' : '—']
              : typeof value === 'string'
                ? value
                  ? [value]
                  : []
                : [...value];
          const labels = values.map(
            (item) => field.options?.find((option) => option.value === item)?.label[locale] ?? item,
          );
          return [field.label[locale], labels.join(', ') || '—'];
        });
      addList(step.title[locale], rows);
    }

    const disclaimer = document.createElement('p');
    disclaimer.className = 'hire-summary__disclaimer';
    disclaimer.textContent = ui.pricingDisclaimer[locale];
    fragment.append(disclaimer);
    container.replaceChildren(fragment);
  }

  #setStatus(message: string, state: 'idle' | 'error' | 'success' = 'error'): void {
    if (this.#status) {
      this.#status.textContent = message;
      this.#status.dataset.state = state;
    }
  }

  async #send(request: HireRequest): Promise<void> {
    if (!this.#endpoint) {
      this.#setStatus(hireCopy.unavailable[this.#locale]);
      return;
    }
    const trap = new FormData(this.#form).get('trap');
    const response = await fetch(this.#endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request,
        verificationToken: this.#verification?.token ?? '',
        startedAt: this.#startedAt,
        trap: typeof trap === 'string' ? trap : '',
      }),
    });
    if (response.ok) {
      this.#clearDraft();
      this.#form.dataset.state = 'sent';
      this.#setStatus(hireCopy.success[this.#locale], 'success');
      return;
    }
    const body = (await response.json().catch(() => ({}))) as { errors?: HireError[] };
    if (response.status === 422 && body.errors?.length) {
      this.#focusFirstInvalidStep(body.errors);
      return;
    }
    this.#verification?.reset();
    this.#setStatus(hireCopy.failure[this.#locale]);
  }

  #focusFirstInvalidStep(errors: readonly HireError[]): void {
    const index = hireSteps.findIndex((step) =>
      errors.some((error) => step.fields.includes(error.field)),
    );
    if (index >= 0) {
      this.#showStep(index);
      this.#renderErrors(errors, hireSteps[index]?.fields ?? []);
    }
  }

  readonly #onSubmit = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();
    if (this.#sending) {
      return;
    }
    const request = this.#read();
    const errors = validateHireRequest(request);
    if (errors.length > 0) {
      this.#focusFirstInvalidStep(errors);
      return;
    }
    this.#sending = true;
    if (this.#submit) {
      this.#submit.disabled = true;
      this.#submit.textContent = hireCopy.sending[this.#locale];
    }
    this.#setStatus('', 'idle');
    try {
      await this.#send(request);
    } catch {
      this.#setStatus(hireCopy.failure[this.#locale]);
    } finally {
      this.#sending = false;
      if (this.#submit) {
        this.#submit.disabled = !this.#endpoint;
        this.#submit.textContent = hireCopy.submit[this.#locale];
      }
    }
  };

  readonly #onChange = (event: Event): void => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.name === 'services') {
      this.#syncConditionalFields();
    }
    if (target instanceof HTMLSelectElement && target.name === 'budget') {
      this.#syncBudgetNotice();
    }
    this.#saveDraft();
  };

  readonly #addDesignService = (): void => {
    const checkbox = this.#form.querySelector<HTMLInputElement>(
      'input[name="services"][value="web-experience-design"]',
    );
    if (checkbox) {
      checkbox.checked = true;
      this.#syncConditionalFields();
      this.#renderErrors(this.#stepErrors(this.#current), hireSteps[this.#current]?.fields ?? []);
      this.#saveDraft();
    }
  };

  readonly #saveDraft = (): void => {
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(this.#read()));
    } catch {
      return;
    }
  };

  #restoreDraft(): void {
    let draft: Partial<Record<HireFieldId, unknown>> | null = null;
    try {
      draft = JSON.parse(sessionStorage.getItem(draftKey) ?? 'null');
    } catch {
      draft = null;
    }
    if (!draft) {
      return;
    }
    for (const field of hireFields) {
      const value = draft[field.id];
      for (const control of this.#controls(field.id)) {
        if (control.type === 'checkbox' || control.type === 'radio') {
          control.checked = Array.isArray(value)
            ? value.includes(control.value)
            : value === true || value === control.value;
        } else if (typeof value === 'string') {
          control.value = value;
        }
      }
    }
  }

  #clearDraft(): void {
    try {
      sessionStorage.removeItem(draftKey);
    } catch {
      return;
    }
  }
}
