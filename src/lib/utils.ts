export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const MESES = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
];

export const MESES_FULL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '0';
  return n.toLocaleString('es-CO');
}

export function formatPercent(n: number | null | undefined): string {
  if (n == null) return '0.00%';
  return `${n.toFixed(2)}%`;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getYearOptions(from = 2024): number[] {
  const current = getCurrentYear();
  const years = [];
  for (let y = from; y <= current + 1; y++) years.push(y);
  return years;
}
