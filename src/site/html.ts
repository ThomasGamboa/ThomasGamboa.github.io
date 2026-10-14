const escapeLookup: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export class SafeHtml {
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  toString(): string {
    return this.value;
  }
}

export type HtmlValue =
  | SafeHtml
  | string
  | number
  | null
  | undefined
  | false
  | readonly HtmlValue[];

export type AttributeValue = string | number | boolean | null | undefined;

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => escapeLookup[character] ?? character);
}

export function raw(value: string): SafeHtml {
  return new SafeHtml(value);
}

function serialize(value: HtmlValue): string {
  if (value === null || value === undefined || value === false) {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return escapeHtml(String(value));
  }
  if (value instanceof SafeHtml) {
    return value.value;
  }
  return value.map(serialize).join('');
}

export function html(strings: TemplateStringsArray, ...values: readonly HtmlValue[]): SafeHtml {
  let output = strings[0] ?? '';
  for (let index = 0; index < values.length; index += 1) {
    output += serialize(values[index]) + (strings[index + 1] ?? '');
  }
  return new SafeHtml(output);
}

export function attributes(record: Readonly<Record<string, AttributeValue>>): SafeHtml {
  const serialized = Object.entries(record).flatMap(([name, value]) => {
    if (value === null || value === undefined || value === false) {
      return [];
    }
    if (value === true) {
      return [` ${name}`];
    }
    return [` ${name}="${escapeHtml(String(value))}"`];
  });
  return new SafeHtml(serialized.join(''));
}

export function jsonScript(data: unknown, type = 'application/ld+json'): SafeHtml {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return html`<script type="${type}">${raw(json)}</script>`;
}
