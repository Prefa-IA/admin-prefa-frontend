export function deslugify(str: string): string {
  if (!str) return '';
  return str
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

