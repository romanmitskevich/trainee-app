const MS_PER_DAY = 86_400_000;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const RU_DATE_PATTERN = /^(\d{2})\.(\d{2})\.(\d{4})$/;

function isoDateToTime(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00Z`);
}

function timeToIsoDate(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

export function addDays(isoDate: string, days: number): string {
  return timeToIsoDate(isoDateToTime(isoDate) + days * MS_PER_DAY);
}

export function getDaysBetween(fromDate: string, toDate: string): number {
  return Math.round((isoDateToTime(toDate) - isoDateToTime(fromDate)) / MS_PER_DAY);
}

export function getWorkDayNumber(hireDate: string, date: string): number {
  return getDaysBetween(hireDate, date) + 1;
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function formatRuDate(isoDate: string): string {
  return isoDate.split('-').reverse().join('.');
}

export function parseDate(text: string | undefined): string | null {
  if (!text) return null;
  const value = text.trim();
  const ruMatch = value.match(RU_DATE_PATTERN);
  const isoDate = ruMatch ? `${ruMatch[3]}-${ruMatch[2]}-${ruMatch[1]}` : ISO_DATE_PATTERN.test(value) ? value : null;
  if (!isoDate) return null;

  const time = isoDateToTime(isoDate);
  return !Number.isNaN(time) && timeToIsoDate(time) === isoDate ? isoDate : null;
}
