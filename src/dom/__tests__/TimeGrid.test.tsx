import { fireEvent, render } from "@testing-library/react";
import type { CalendarEvent } from "../../headless";
import { TimeGrid } from "../TimeGrid";

const day = new Date(2026, 5, 26);
const events: CalendarEvent[] = [
  { title: "Focus", start: new Date(2026, 5, 26, 14, 0), end: new Date(2026, 5, 26, 16, 0) },
];

// The event chip sits inside the absolutely-positioned wrapper that carries the
// pointer handlers: title div -> default-event root -> wrapper.
function wrapperOf(chip: HTMLElement): HTMLElement {
  return chip.parentElement!.parentElement!;
}

describe("dom TimeGrid", () => {
  it("renders timed events with their time label", () => {
    const { getByText } = render(
      <TimeGrid date={day} mode="day" events={events} hourHeight={48} />,
    );
    expect(getByText("Focus")).toBeTruthy();
    expect(getByText("14:00–16:00")).toBeTruthy();
  });

  it("drag-moves an event and reports the snapped new times", () => {
    const onDragEvent = jest.fn();
    const { getByText } = render(
      <TimeGrid date={day} mode="day" events={events} hourHeight={48} onDragEvent={onDragEvent} />,
    );
    const box = wrapperOf(getByText("Focus"));
    // Drag up 96px = 2h at 48px/hour: 14:00–16:00 -> 12:00–14:00.
    fireEvent.pointerDown(box, { clientY: 300, pointerId: 1 });
    fireEvent.pointerMove(box, { clientY: 204, pointerId: 1 });
    fireEvent.pointerUp(box, { clientY: 204, pointerId: 1 });

    expect(onDragEvent).toHaveBeenCalledTimes(1);
    const [, start, end] = onDragEvent.mock.calls[0] as [CalendarEvent, Date, Date];
    expect(start.getHours()).toBe(12);
    expect(end.getHours()).toBe(14);
  });

  it("treats a press with no movement as a tap, not a drag", () => {
    const onDragEvent = jest.fn();
    const onPressEvent = jest.fn();
    const { getByText } = render(
      <TimeGrid
        date={day}
        mode="day"
        events={events}
        hourHeight={48}
        onDragEvent={onDragEvent}
        onPressEvent={onPressEvent}
      />,
    );
    const box = wrapperOf(getByText("Focus"));
    fireEvent.pointerDown(box, { clientY: 300, pointerId: 1 });
    fireEvent.pointerUp(box, { clientY: 300, pointerId: 1 });

    expect(onDragEvent).not.toHaveBeenCalled();
    expect(onPressEvent).toHaveBeenCalledTimes(1);
  });
});
