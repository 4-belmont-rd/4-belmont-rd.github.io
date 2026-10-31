import { addDays, fromIsoDate } from "./dates";

export interface Stay {
  checkIn: string;
  checkOut: string;
}

export class CalendarUnavailable extends Error {}

export async function fetchCalendar(env: Env): Promise<string> {
  let response: Response;
  try {
    response = await fetch(env.AIRBNB_ICAL_URL, { cf: { cacheTtl: 900, cacheEverything: true } });
  } catch (cause) {
    throw new CalendarUnavailable("Calendar fetch failed", { cause });
  }
  if (!response.ok) throw new CalendarUnavailable(`Calendar responded ${response.status}`);
  const text = await response.text();
  if (!text.includes("BEGIN:VCALENDAR")) throw new CalendarUnavailable("Calendar response is not iCalendar");
  return text;
}

export async function fetchBookedStays(env: Env): Promise<Stay[]> {
  return parseBookedStays(await fetchCalendar(env));
}

export function parseBookedStays(ical: string): Stay[] {
  const lines = ical.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
  const stays: Stay[] = [];
  let start: string | null = null;
  let end: string | null = null;
  let inEvent = false;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      start = null;
      end = null;
    } else if (line === "END:VEVENT") {
      if (inEvent && start) {
        const checkOut = end && end > start ? end : addDays(start, 1);
        stays.push({ checkIn: start, checkOut });
      }
      inEvent = false;
    } else if (inEvent && /^DTSTART[;:]/.test(line)) {
      start = icalDate(line);
    } else if (inEvent && /^DTEND[;:]/.test(line)) {
      end = icalDate(line);
    }
  }
  return stays.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
}

function icalDate(line: string): string | null {
  const match = /:(\d{4})(\d{2})(\d{2})/.exec(line);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

export function isFree(booked: Stay[], checkIn: string, checkOut: string): boolean {
  return !booked.some((stay) => stay.checkIn < checkOut && checkIn < stay.checkOut);
}

export function freeRanges(booked: Stay[], from: string, to: string): (Stay & { nights: number })[] {
  const ranges: (Stay & { nights: number })[] = [];
  let cursor = from;
  for (const stay of booked) {
    if (stay.checkOut <= cursor || stay.checkIn >= to) continue;
    if (stay.checkIn > cursor) ranges.push(range(cursor, stay.checkIn));
    if (stay.checkOut > cursor) cursor = stay.checkOut;
  }
  if (cursor < to) ranges.push(range(cursor, to));
  return ranges;
}

function range(checkIn: string, checkOut: string): Stay & { nights: number } {
  return { checkIn, checkOut, nights: fromIsoDate(checkOut) - fromIsoDate(checkIn) };
}

export function nearestFreeRanges(booked: Stay[], checkIn: string, checkOut: string, today: string, horizon: string, count = 3) {
  const nights = fromIsoDate(checkOut) - fromIsoDate(checkIn);
  const target = fromIsoDate(checkIn);
  return freeRanges(booked, today, horizon)
    .filter((free) => free.nights >= nights)
    .sort((a, b) => distance(a) - distance(b))
    .slice(0, count);

  function distance(free: Stay): number {
    const earliest = fromIsoDate(free.checkIn);
    const latest = fromIsoDate(free.checkOut) - nights;
    if (target < earliest) return earliest - target;
    if (target > latest) return target - latest;
    return 0;
  }
}
