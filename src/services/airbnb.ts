let startDates: Date[] = [];
let endDates: Date[] = [];

export async function fetchBookedDates(): Promise<Date[]> {
  const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent("https://www.airbnb.com/calendar/ical/1221766328608212785.ics?s=4d2dd1dfb1a415240779bbded1cfe075&locale=en-GB")}`;
  const response = await fetch(proxiedUrl);
  const icalText = await response.text();

  for (const line of icalText.split("\n")) {
    if (line.startsWith("DTSTART")) {
      let date = line.replace("DTSTART;VALUE=DATE:", "");
      let x = parseDate(date);
      x.setHours(0, 0, 0, 0)
      startDates.push(x);
    }
    if (line.startsWith("DTEND")) {
      let date = line.replace("DTEND;VALUE=DATE:", "");
      let x = parseDate(date);
      x.setHours(0, 0, 0, 0)
      endDates.push(x);
    }
  }
  const combined: DateRange[] = startDates.map((start, index) => ({
    start,
    end: endDates[index] ?? null
  }));

  let takenDates = getDatesBetween(combined)
  console.log("taken", combined, takenDates)
  return takenDates;

}

export interface DateRange {
  start: Date;
  end: Date | null;
}

function getDatesBetween(ranges: DateRange[]): Date[] {
  let takenDates: Date[] = [];
  ranges.forEach(range => {

    const { start, end } = range;
    start.setDate(start.getDate() + 1)
    if (!end) return [start];

    let currentDate = new Date(start); // Clone start date

    while (currentDate < end) {
      takenDates.push(new Date(currentDate)); // Add a copy to avoid mutation
      currentDate.setDate(currentDate.getDate() + 1); // Move to next day
    }

  });

  return takenDates;
}

function parseDate(date: string): Date {
  let year = date.slice(0, 4);
  let month = date.slice(4, 6);
  let day = date.slice(6, 8);

  const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return new Date(formattedDate);
}
