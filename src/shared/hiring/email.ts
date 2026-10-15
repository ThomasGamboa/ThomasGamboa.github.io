import { type HireFieldId, hireSteps } from '../../content/hiring.ts';
import type { Service } from '../../content/types.ts';
import { escapeHtml } from '../escape.ts';
import { formatPrice } from '../i18n/format.ts';
import type { Locale } from '../i18n/locales.ts';
import { summarizePricing } from './pricing.ts';
import { fieldById, type HireRequest, isFieldActive } from './request.ts';

export interface HireEmail {
  readonly subject: string;
  readonly text: string;
  readonly html: string;
}

export interface HireEmailContext {
  readonly receivedAt: Date;
  readonly origin: string;
}

const reader: Locale = 'es';

interface Row {
  readonly label: string;
  readonly value: string;
}

interface Section {
  readonly title: string;
  readonly rows: readonly Row[];
}

function priceLabel(service: Service): string {
  return service.startingPrice
    ? `desde ${formatPrice(service.startingPrice, reader)}`
    : 'según alcance';
}

function answer(request: HireRequest, id: HireFieldId): string {
  const field = fieldById(id);
  const value = request[id];
  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }
  const values = typeof value === 'string' ? (value ? [value] : []) : [...value];
  if (values.length === 0) {
    return '—';
  }
  return values
    .map((item) => field.options?.find((option) => option.value === item)?.label[reader] ?? item)
    .join(', ');
}

function buildSections(request: HireRequest): Section[] {
  const pricing = summarizePricing(request);
  const services: Section = {
    title: 'Servicios',
    rows: [
      ...pricing.services.map((service) => ({
        label: service.name[reader],
        value: priceLabel(service),
      })),
      ...pricing.addons.map((service) => ({
        label: `Adicional · ${service.name[reader]}`,
        value: priceLabel(service),
      })),
      {
        label: 'Total inicial estimado',
        value: pricing.startingTotal ? `desde ${formatPrice(pricing.startingTotal, reader)}` : '—',
      },
    ],
  };

  const answered = hireSteps
    .filter((step) => step.id !== 'services' && step.fields.length > 0)
    .map(
      (step): Section => ({
        title: step.title[reader],
        rows: step.fields
          .map((id) => fieldById(id))
          .filter((field) => isFieldActive(field, request.services))
          .map((field) => ({ label: field.label[reader], value: answer(request, field.id) })),
      }),
    );

  return [services, ...answered];
}

export function composeHireEmail(request: HireRequest, context: HireEmailContext): HireEmail {
  const pricing = summarizePricing(request);
  const flags = pricing.budgetBelowStart ? ' [presupuesto bajo]' : '';
  const headline = pricing.services.map((service) => service.name[reader]).join(' + ');
  const subject = `Solicitud de contratación${flags}: ${request.name} — ${headline}`.slice(0, 200);
  const sections = buildSections(request);
  const meta = [
    `Idioma del cliente: ${request.locale.toUpperCase()}`,
    `Recibida: ${context.receivedAt.toISOString()}`,
    `Origen: ${context.origin}`,
  ];

  const text = [
    subject,
    '',
    ...sections.flatMap((section) => [
      section.title.toUpperCase(),
      ...section.rows.map((row) => `- ${row.label}: ${row.value}`),
      '',
    ]),
    ...meta,
  ].join('\n');

  const rows = (section: Section) =>
    section.rows
      .map(
        (row) =>
          `<tr><th align="left" valign="top" style="padding:6px 16px 6px 0;color:#8d8a85;font-weight:400;white-space:nowrap">${escapeHtml(row.label)}</th><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(row.value)}</td></tr>`,
      )
      .join('');
  const html = `<!doctype html><html lang="es"><body style="margin:0;padding:32px;background:#000;color:#ebe8e3;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5">
<p style="margin:0 0 4px;color:#ff6565;font-family:monospace;letter-spacing:.12em;text-transform:uppercase;font-size:11px">Solicitud de contratación${escapeHtml(flags)}</p>
<h1 style="margin:0 0 24px;font-size:22px;font-weight:400">${escapeHtml(request.name)}</h1>
${sections.map((section) => `<h2 style="margin:24px 0 8px;font-size:12px;color:#ff6565;font-family:monospace;letter-spacing:.12em;text-transform:uppercase">${escapeHtml(section.title)}</h2><table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">${rows(section)}</table>`).join('\n')}
<p style="margin:32px 0 0;color:#55534f;font-size:12px">${meta.map(escapeHtml).join('<br>')}</p>
</body></html>`;

  return { subject, text, html };
}
