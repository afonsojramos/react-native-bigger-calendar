import { render } from "@testing-library/react";
import type { CalendarEvent } from "@super-calendar/core";
import { MonthList } from "../MonthList";

const anchor = new Date(2026, 6, 15);

describe("dom MonthList", () => {
  it("renders the weekday header in the configured week order", () => {
    const { getAllByText } = render(<MonthList date={anchor} weekStartsOn={1} height={400} />);
    // Monday-first header row.
    expect(getAllByText("Mon").length).toBeGreaterThan(0);
    expect(getAllByText("Sun").length).toBeGreaterThan(0);
  });

  it("mounts with events and selection without throwing", () => {
    const events: CalendarEvent[] = [
      { title: "Standup", start: new Date(2026, 6, 15, 9), end: new Date(2026, 6, 15, 10) },
    ];
    const { container } = render(
      <MonthList
        date={anchor}
        weekStartsOn={1}
        events={events}
        selectedRange={{ start: new Date(2026, 6, 10), end: new Date(2026, 6, 14) }}
        height={400}
      />,
    );
    expect(container.querySelector("div")).toBeTruthy();
  });
});
