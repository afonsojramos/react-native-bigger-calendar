import { render } from "@testing-library/react";
import { Profiler } from "react";
import type { DateRange } from "@super-calendar/core";
import { MonthView } from "../MonthView";

// Deterministic perf guard: changing the selection must commit the grid once,
// not cascade. This catches the regression class the architecture worries about
// (a selection change re-rendering far more than it should).
describe("dom MonthView render cost", () => {
  it("commits once per selection change", () => {
    let commits = 0;
    const onRender = () => {
      commits += 1;
    };
    const month = new Date(2030, 0, 1);
    const view = (range: DateRange) => (
      <Profiler id="month" onRender={onRender}>
        <MonthView date={month} weekStartsOn={1} selectedRange={range} />
      </Profiler>
    );

    const { rerender } = render(view({ start: new Date(2030, 0, 6), end: new Date(2030, 0, 10) }));
    const afterMount = commits;

    rerender(view({ start: new Date(2030, 0, 6), end: new Date(2030, 0, 12) }));
    expect(commits - afterMount).toBe(1);
  });
});
