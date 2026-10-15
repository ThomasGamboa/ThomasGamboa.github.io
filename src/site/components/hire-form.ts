import {
  type HireField,
  type HireFieldId,
  hireCopy,
  hireFields,
  hireSteps,
} from '../../content/hiring.ts';
import { serviceCategories } from '../../content/services.ts';
import type { Service, ServiceCategory } from '../../content/types.ts';
import { ui } from '../../content/ui.ts';
import { formatIndex, formatPrice } from '../../shared/i18n/format.ts';
import type { Locale } from '../../shared/i18n/locales.ts';
import { attributes, html, type SafeHtml } from '../html.ts';

export interface HireFormOptions {
  readonly locale: Locale;
  readonly endpoint: string | null;
  readonly siteKey: string | null;
}

function fieldDefinition(id: HireFieldId): HireField {
  const field = hireFields.find((candidate) => candidate.id === id);
  if (!field) {
    throw new Error(`Unknown hire field "${id}"`);
  }
  return field;
}

function describedBy(field: HireField): string {
  return [field.hint ? `hint-${field.id}` : null, `error-${field.id}`].filter(Boolean).join(' ');
}

function feedback(field: HireField, locale: Locale): SafeHtml {
  return html`${field.hint ? html`<p class="field__hint" id="hint-${field.id}">${field.hint[locale]}</p>` : null}
<p class="field__error" id="error-${field.id}" data-error-for="${field.id}" aria-live="polite"></p>`;
}

function priceText(service: Service, locale: Locale): string {
  return service.startingPrice
    ? `${ui.priceFrom[locale]} ${formatPrice(service.startingPrice, locale)}`
    : ui.priceOnRequest[locale];
}

function renderCatalog(field: HireField, categories: readonly ServiceCategory[], locale: Locale) {
  const groups = categories.map(
    (category) => html`<div class="service-group" data-service-category="${category.id}">
  ${categories.length > 1 ? html`<p class="service-group__title"><span class="service-group__index" aria-hidden="true">${String.fromCharCode(65 + serviceCategories.indexOf(category))}</span> ${category.title[locale]}</p>` : null}
  <div class="service-group__options">${category.services.map(
    (service) => html`<label class="service-option liquid-glass" data-service="${service.id}">
    <input type="checkbox" name="${field.id}" value="${service.id}"${attributes({ 'aria-describedby': describedBy(field) })}>
    <span class="service-option__body">
      <span class="service-option__name">${service.name[locale]}</span>
      <span class="service-option__description">${service.description[locale]}</span>
      ${service.note ? html`<span class="service-option__note">${service.note[locale]}</span>` : null}
      <span class="service-option__price">${priceText(service, locale)}</span>
    </span>
  </label>`,
  )}</div>
</div>`,
  );

  return html`<fieldset class="field field--catalog" data-field="${field.id}">
  <legend class="field__label">${field.label[locale]}</legend>
  ${groups}
  ${feedback(field, locale)}
</fieldset>`;
}

function renderChoices(field: HireField, locale: Locale, type: 'radio' | 'checkbox') {
  return html`<fieldset class="field field--choices" data-field="${field.id}"${attributes({ 'data-when-services': field.whenServices?.join(' ') })}>
  <legend class="field__label">${field.label[locale]}</legend>
  <div class="field__choices">${(field.options ?? []).map(
    (option) => html`<label class="choice">
    <input type="${type}" name="${field.id}" value="${option.value}"${attributes({ 'aria-describedby': describedBy(field) })}>
    <span>${option.label[locale]}</span>
  </label>`,
  )}</div>
  ${field.id === 'designStatus' ? html`<button class="field__action" type="button" data-add-service="web-experience-design" hidden>${hireCopy.addDesign[locale]}</button>` : null}
  ${feedback(field, locale)}
</fieldset>`;
}

function renderControl(field: HireField, locale: Locale): SafeHtml {
  const common = {
    id: `field-${field.id}`,
    name: field.id,
    'aria-describedby': describedBy(field),
    required: field.required,
    minlength: field.minLength,
    maxlength: field.maxLength,
    autocomplete: field.autocomplete,
  };
  switch (field.kind) {
    case 'select':
      return html`<select${attributes(common)}><option value="">—</option>${(field.options ?? []).map((option) => html`<option value="${option.value}">${option.label[locale]}</option>`)}</select>`;
    case 'textarea':
      return html`<textarea${attributes({ ...common, rows: field.minLength ? 6 : 3 })}></textarea>`;
    case 'date':
      return html`<input${attributes({ ...common, type: 'date' })}>`;
    case 'email':
      return html`<input${attributes({ ...common, type: 'email', inputmode: 'email' })}>`;
    case 'url':
      return html`<input${attributes({ ...common, type: 'url', inputmode: 'url', placeholder: 'https://' })}>`;
    default:
      return html`<input${attributes({ ...common, type: 'text' })}>`;
  }
}

function renderField(id: HireFieldId, locale: Locale): SafeHtml {
  const field = fieldDefinition(id);
  switch (field.kind) {
    case 'services':
      return renderCatalog(
        field,
        serviceCategories.filter((category) => category.kind === 'primary'),
        locale,
      );
    case 'addons':
      return renderCatalog(
        field,
        serviceCategories.filter((category) => category.kind === 'additional'),
        locale,
      );
    case 'single-choice':
      return renderChoices(field, locale, 'radio');
    case 'multi-choice':
      return renderChoices(field, locale, 'checkbox');
    case 'checkbox':
      return html`<div class="field field--consent" data-field="${field.id}">
  <label class="choice">
    <input type="checkbox" name="${field.id}" value="true"${attributes({ id: `field-${field.id}`, required: true, 'aria-describedby': describedBy(field) })}>
    <span>${field.label[locale]}</span>
  </label>
  ${feedback(field, locale)}
</div>`;
    default:
      return html`<div class="field" data-field="${field.id}"${attributes({ 'data-when-services': field.whenServices?.join(' ') })}>
  <label class="field__label" for="field-${field.id}">${field.label[locale]}</label>
  ${renderControl(field, locale)}
  ${feedback(field, locale)}
</div>`;
  }
}

export function renderHireForm({ locale, endpoint, siteKey }: HireFormOptions): SafeHtml {
  const total = formatIndex(hireSteps.length);
  const progress = hireSteps.map(
    (step, index) =>
      html`<li class="hire-progress__step" data-progress-step="${step.id}"><span class="hire-progress__index">${formatIndex(index + 1)}</span> ${step.title[locale]}</li>`,
  );

  const steps = hireSteps.map(
    (step, index) => html`<fieldset class="hire-step" id="step-${step.id}" data-step="${step.id}">
  <legend class="hire-step__title"><span class="hire-step__index">${hireCopy.step[locale]} ${formatIndex(index + 1)} ${hireCopy.of[locale]} ${total}</span> ${step.title[locale]}</legend>
  <p class="hire-step__description">${step.description[locale]}</p>
  ${step.id === 'planning' ? html`<p class="hire-notice" data-budget-notice hidden>${hireCopy.budgetBelow[locale]}</p>` : null}
  ${step.fields.map((id) => renderField(id, locale))}
  ${
    step.id === 'review'
      ? html`<div class="hire-summary liquid-glass" data-hire-summary></div>
  <div class="hire-verification" data-hire-verification aria-label="${hireCopy.verification[locale]}"></div>`
      : null
  }
</fieldset>`,
  );

  return html`<form class="hire-form" data-hire-form novalidate${attributes({
    'data-locale': locale,
    'data-endpoint': endpoint,
    'data-site-key': siteKey,
  })}>
  <ol class="hire-progress" aria-hidden="true">${progress}</ol>
  <div class="hire-form__trap" aria-hidden="true">
    <label>Website<input type="text" name="trap" tabindex="-1" autocomplete="off"></label>
  </div>
  ${steps}
  <p class="hire-form__disclaimer">${ui.pricingDisclaimer[locale]}</p>
  <div class="hire-form__actions">
    <button class="hire-button hire-button--ghost" type="button" data-hire-previous hidden>${hireCopy.previous[locale]}</button>
    <button class="hire-button liquid-pill" type="button" data-hire-next hidden>${hireCopy.next[locale]}</button>
    <button class="hire-button hire-button--primary liquid-pill liquid-pill--signal" type="submit" data-hire-submit>${hireCopy.submit[locale]}</button>
  </div>
  <p class="hire-form__status" role="status" aria-live="polite" data-hire-status>${endpoint ? null : hireCopy.unavailable[locale]}</p>
  <noscript><p class="hire-form__status">${hireCopy.noscript[locale]}</p></noscript>
</form>`;
}
