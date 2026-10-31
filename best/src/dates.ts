const DAY_MS = 86_400_000;

export const BOOKING_HORIZON_DAYS = 548;

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return toIsoDate(fromIsoDate(value)) === value;
}

export function fromIsoDate(value: string): number {
  return Date.UTC(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, Number(value.slice(8, 10))) / DAY_MS;
}

export function toIsoDate(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

export function addDays(value: string, days: number): string {
  return toIsoDate(fromIsoDate(value) + days);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return fromIsoDate(checkOut) - fromIsoDate(checkIn);
}

export function todayInLondon(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function latestCheckOut(today: string): string {
  return addDays(today, BOOKING_HORIZON_DAYS);
}
