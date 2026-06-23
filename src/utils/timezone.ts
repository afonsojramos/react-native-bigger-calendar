import type { CalendarEvent } from "../types";

/**
 * Reinterpret an instant as its wall-clock time in `timeZone`, returned as a
 * device-local `Date` whose fields (hours, minutes, …) read back as that zone's
 * clock. The calendar lays events out from `getHours()`/`getMinutes()`, so
 * passing zoned dates makes it render in `timeZone` regardless of the device.
 *
 * DST-correct via `Intl` (available on modern React Native Hermes/JSC and the
 * web). The result is for display/layout only; it no longer points at the
 * original UTC instant, so don't round-trip it back to a real time.
 */
export function toZonedTime(date: Date, timeZone: string): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const field = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((p) => p.type === type);
    return part ? Number(part.value) : 0;
  };

  // `h23` can report midnight as 24; normalise to 0.
  const hour = field("hour") % 24;
  return new Date(
    field("year"),
    field("month") - 1,
    field("day"),
    hour,
    field("minute"),
    field("second"),
    date.getMilliseconds(),
  );
}

/**
 * Map every event's `start`/`end` through {@link toZonedTime} so the calendar
 * displays them in `timeZone`. Other fields are preserved. Memoize the result
 * (e.g. with `useMemo`) since it allocates new dates.
 */
export function eventsInTimeZone<T>(
  events: CalendarEvent<T>[],
  timeZone: string,
): CalendarEvent<T>[] {
  return events.map((event) => ({
    ...event,
    start: toZonedTime(event.start, timeZone),
    end: toZonedTime(event.end, timeZone),
  }));
}
