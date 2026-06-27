import { render } from "@testing-library/react";
import type { CalendarEvent } from "@super-calendar/core";
import { Calendar } from "../Calendar";

const date = new Date(2026, 6, 15);
// A 2-hour event: tall enough that the time grid keeps its time label visible.
const events: CalendarEvent[] = [
  { title: "Standup", start: new Date(2026, 6, 15, 9), end: new Date(2026, 6, 15, 11) },
];

describe("dom Calendar", () => {
  it("renders a month grid in month mode", () => {
    const { getByText, queryByText } = render(
      <Calendar mode="month" date={date} events={events} weekStartsOn={1} />,
    );
    expect(getByText("July 2026")).toBeTruthy(); // month title (MonthView)
    expect(getByText("Standup")).toBeTruthy(); // chip
    expect(queryByText("09:00 - 11:00")).toBeNull(); // no time-grid label in month mode
  });

  it("renders a time grid in week mode", () => {
    const { getByText } = render(
      <Calendar mode="week" date={date} events={events} weekStartsOn={1} hourHeight={48} />,
    );
    expect(getByText("Standup")).toBeTruthy();
    expect(getByText("09:00 - 11:00")).toBeTruthy(); // time-grid label
  });

  it("defaults to the week time grid", () => {
    const { getByText } = render(<Calendar date={date} events={events} hourHeight={48} />);
    expect(getByText("09:00 - 11:00")).toBeTruthy();
  });
});
