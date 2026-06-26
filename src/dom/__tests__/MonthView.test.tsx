import { fireEvent, render } from "@testing-library/react";
import { MonthView } from "../MonthView";

describe("dom MonthView", () => {
  it("renders the month title and weekday headers", () => {
    const { getByText, getAllByText } = render(
      <MonthView date={new Date(2026, 6, 1)} weekStartsOn={1} />,
    );
    expect(getByText("July 2026")).toBeTruthy();
    expect(getAllByText("Mon").length).toBeGreaterThan(0);
  });

  it("fires onPressDay with the clicked date", () => {
    const onPressDay = jest.fn();
    const { getByLabelText } = render(
      <MonthView date={new Date(2026, 6, 1)} weekStartsOn={1} onPressDay={onPressDay} />,
    );
    fireEvent.click(getByLabelText("Wednesday, 15 July 2026"));
    expect(onPressDay).toHaveBeenCalledTimes(1);
    const clicked = onPressDay.mock.calls[0][0] as Date;
    expect(clicked.getDate()).toBe(15);
    expect(clicked.getMonth()).toBe(6);
  });

  it("disables days outside the min/max range", () => {
    const onPressDay = jest.fn();
    const { getByLabelText } = render(
      <MonthView
        date={new Date(2026, 6, 1)}
        weekStartsOn={1}
        minDate={new Date(2026, 6, 10)}
        onPressDay={onPressDay}
      />,
    );
    const early = getByLabelText("Wednesday, 8 July 2026") as HTMLButtonElement;
    expect(early.disabled).toBe(true);
    fireEvent.click(early);
    expect(onPressDay).not.toHaveBeenCalled();
  });
});
