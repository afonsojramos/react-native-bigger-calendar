import { fireEvent, render } from "@testing-library/react";
import type { CalendarEvent } from "@super-calendar/core";

// The real Legend List needs measured layout to page through `renderItem`, which
// jsdom can't provide, so it never mounts item content. This stand-in renders
// every item synchronously so the tests actually exercise MonthView + the
// eventsByDay handoff.
jest.mock("@legendapp/list/react", () => ({
  __esModule: true,
  LegendList: (props: {
    data?: unknown[];
    renderItem: (arg: { item: unknown; index: number }) => unknown;
  }) => (props.data ?? []).map((item, index) => props.renderItem({ item, index })),
}));

import { MonthList } from "../MonthList";

const anchor = new Date(2026, 6, 15);

describe("dom MonthList", () => {
  it("renders the weekday header in the configured week order", () => {
    const { getAllByText } = render(
      <MonthList date={anchor} weekStartsOn={1} pastMonths={0} futureMonths={0} height={400} />,
    );
    expect(getAllByText("Mon").length).toBeGreaterThan(0);
    expect(getAllByText("Sun").length).toBeGreaterThan(0);
  });

  it("renders event chips for the anchor month via the prebuilt index", () => {
    const events: CalendarEvent[] = [
      { title: "Sync", start: new Date(2026, 6, 15, 9), end: new Date(2026, 6, 15, 10) },
    ];
    const { getByText } = render(
      <MonthList
        date={anchor}
        weekStartsOn={1}
        events={events}
        pastMonths={0}
        futureMonths={0}
        height={400}
      />,
    );
    expect(getByText("Sync")).toBeTruthy();
  });

  it("fires onPressDay with the clicked day", () => {
    const onPressDay = jest.fn();
    const { getByLabelText } = render(
      <MonthList
        date={anchor}
        weekStartsOn={1}
        pastMonths={0}
        futureMonths={0}
        height={400}
        onPressDay={onPressDay}
      />,
    );
    fireEvent.click(getByLabelText("Wednesday, 15 July 2026"));
    expect(onPressDay).toHaveBeenCalledTimes(1);
    expect((onPressDay.mock.calls[0][0] as Date).getDate()).toBe(15);
  });
});
