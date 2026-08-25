const monthNames: Record<string, number> = {
  ene: 1,
  enero: 1,
  jan: 1,
  january: 1,
  feb: 2,
  febrero: 2,
  february: 2,
  mar: 3,
  marzo: 3,
  march: 3,
  abr: 4,
  abril: 4,
  apr: 4,
  april: 4,
  may: 5,
  mayo: 5,
  jun: 6,
  junio: 6,
  june: 6,
  jul: 7,
  julio: 7,
  july: 7,
  ago: 8,
  agosto: 8,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  septiembre: 9,
  september: 9,
  oct: 10,
  octubre: 10,
  october: 10,
  nov: 11,
  noviembre: 11,
  november: 11,
  dic: 12,
  diciembre: 12,
  dec: 12,
  december: 12,
};

export function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeMoney(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = normalizeText(value)
    .replace(/[$€£\s]/g, '')
    .replace(/,/g, '');
  if (!normalized) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

export function normalizeStage(value: unknown): number | null {
  const stage = normalizeMoney(normalizeText(value).replace('%', ''));
  return stage !== null && [0, 25, 50, 75, 90, 100].includes(stage) ? stage : null;
}

export function normalizeDate(
  value: unknown,
  fallbackYear = new Date().getUTCFullYear(),
): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'number' && value > 1) {
    const excelEpoch = Date.UTC(1899, 11, 30);
    return new Date(excelEpoch + value * 86_400_000);
  }
  const text = normalizeText(value).toLowerCase();
  if (!text) return null;
  const month = monthNames[text];
  if (month) return new Date(Date.UTC(fallbackYear, month - 1, 1));
  const dayMonthYear = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (dayMonthYear) {
    const [, day, rawMonth, rawYear] = dayMonthYear;
    const year = Number(rawYear) < 100 ? 2000 + Number(rawYear) : Number(rawYear);
    const parsed = new Date(Date.UTC(year, Number(rawMonth) - 1, Number(day)));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
