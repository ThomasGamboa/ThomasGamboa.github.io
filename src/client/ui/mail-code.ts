function reverse(value: string): string {
  return [...value].reverse().join('');
}

export function decodeMail(element: HTMLElement): string {
  const key = Number(element.dataset.mailKey);
  const stride = Number(element.dataset.mailStride);
  const [user = '', host = ''] = (element.dataset.mail ?? '')
    .split('.')
    .map((part, index) =>
      String.fromCharCode((Number.parseInt(part, 36) ^ (key + index * stride)) & 0xff),
    )
    .join('')
    .split('|');
  return `${reverse(user)}@${reverse(host)}`;
}
