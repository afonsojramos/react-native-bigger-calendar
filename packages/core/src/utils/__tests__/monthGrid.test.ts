import { buildMonthGrid } from "../monthGrid";

const month = new Date(2026, 5, 15); // June 2026

const findDay = (g: ReturnType<typeof buildMonthGrid>, id: string) =>
  g.weeks.flatMap((w) => w.days).find((d) => d.id === id);

describe("buildMonthGrid", () => {
  it("returns whole weeks and seven weekday labels", () => {
    const g = buildMonthGrid(month, { weekStartsOn: 1 });
    expect(g.weeks.every((w) => w.days.length === 7)).toBe(true);
    expect(g.weekdays.map((w) => w.label)).toEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ]);
  });

  it("flags current-month vs adjacent days", () => {
    const g = buildMonthGrid(month, { weekStartsOn: 0 });
    expect(findDay(g, "2026-06-15")?.isCurrentMonth).toBe(true);
    expect(findDay(g, "2026-05-31")?.isCurrentMonth).toBe(false);
  });

  it("annotates range endpoints, interior and outside days", () => {
    const g = buildMonthGrid(month, {
      selectedRange: { start: new Date(2026, 5, 10), end: new Date(2026, 5, 14) },
    });
    expect(findDay(g, "2026-06-10")).toMatchObject({
      isRangeStart: true,
      isSelected: true,
      isInRange: true,
    });
    expect(findDay(g, "2026-06-12")).toMatchObject({ isSelected: false, isInRange: true });
    expect(findDay(g, "2026-06-14")).toMatchObject({ isRangeEnd: true, isSelected: true });
    expect(findDay(g, "2026-06-16")).toMatchObject({ isInRange: false, isSelected: false });
  });

  it("marks disabled days and never selects them", () => {
    const g = buildMonthGrid(month, {
      minDate: new Date(2026, 5, 10),
      selectedDates: [new Date(2026, 5, 5)],
    });
    expect(findDay(g, "2026-06-05")).toMatchObject({ isDisabled: true, isSelected: false });
    expect(findDay(g, "2026-06-15")?.isDisabled).toBe(false);
  });
});
