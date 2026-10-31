import property from "../../src/property.json";
import { fetchBookedStays, freeRanges, isFree } from "./calendar";
import { QUERIES, type QueryName } from "./catalogue";
import { BOOKING_HORIZON_DAYS, latestCheckOut, nightsBetween, todayInLondon } from "./dates";
import { error, json } from "./http";
import { validate } from "./validation";

export async function executeQuery(name: QueryName, url: URL, env: Env): Promise<Response> {
  const params = Object.fromEntries(url.searchParams);
  const schema = QUERIES[name].parameters;
  if (schema) {
    const problems = validate(schema, params);
    if (problems.length) {
      return error(400, "INVALID_PARAMETER", problems[0].problem, { parameter: problems[0].field, problems });
    }
  }
  switch (name) {
    case "property-description":
      return json({
        name: property.name,
        summary: property.summary,
        description: property.description,
        location: property.location,
        reviewsUrl: property.reviewsUrl,
      });
    case "property-features":
      return json({
        floors: property.floors,
        bedrooms: property.bedrooms,
        extraBeds: property.extraBeds,
        maxGuests: property.maxGuests,
        amenities: property.amenities,
        parking: property.parking,
      });
    case "availability": {
      const rangeError = checkRange(params.from, params.to, "from", "to");
      if (rangeError) return rangeError;
      const booked = await fetchBookedStays(env);
      return json({
        from: params.from,
        to: params.to,
        available: isFree(booked, params.from, params.to),
        freeRanges: freeRanges(booked, params.from, params.to),
      });
    }
    case "booking-quote": {
      const rangeError = checkRange(params.checkIn, params.checkOut, "checkIn", "checkOut");
      if (rangeError) return rangeError;
      const booked = await fetchBookedStays(env);
      return json({
        ...quote(params.checkIn, params.checkOut),
        guests: Number(params.guests),
        available: isFree(booked, params.checkIn, params.checkOut),
      });
    }
  }
}

export function quote(checkIn: string, checkOut: string) {
  const nights = nightsBetween(checkIn, checkOut);
  const { currency, pricePerNight, bookingFee } = property.pricing;
  const subtotal = nights * pricePerNight;
  return { checkIn, checkOut, nights, currency, pricePerNight, subtotal, bookingFee, total: subtotal + bookingFee };
}

export interface RangeProblem {
  code: "DATES_IN_PAST" | "INVALID_DATE_RANGE" | "BEYOND_BOOKING_HORIZON";
  message: string;
  field: string;
}

export function rangeProblem(start: string, end: string, startName: string, endName: string): RangeProblem | null {
  const today = todayInLondon();
  if (start < today) {
    return { code: "DATES_IN_PAST", message: `'${startName}' must be today (${today}) or later.`, field: startName };
  }
  if (end <= start) {
    return { code: "INVALID_DATE_RANGE", message: `'${endName}' must be after '${startName}'.`, field: endName };
  }
  const horizon = latestCheckOut(today);
  if (end > horizon) {
    return {
      code: "BEYOND_BOOKING_HORIZON",
      message: `'${endName}' must be within ${BOOKING_HORIZON_DAYS} days of today (on or before ${horizon}).`,
      field: endName,
    };
  }
  return null;
}

function checkRange(start: string, end: string, startName: string, endName: string): Response | null {
  const problem = rangeProblem(start, end, startName, endName);
  return problem ? error(400, problem.code, problem.message, { parameter: problem.field }) : null;
}
