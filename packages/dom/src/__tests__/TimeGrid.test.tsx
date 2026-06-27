import { fireEvent, render } from "@testing-library/react";
import type { CalendarEvent } from "@super-calendar/core";
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
    expect(getByText("14:00 - 16:00")).toBeTruthy();
  });

  it("hides the time line on a short event in a narrow multi-column view", () => {
    const short: CalendarEvent[] = [
      { title: "Quick", start: new Date(2026, 5, 26, 9, 0), end: new Date(2026, 5, 26, 9, 30) },
    ];
    const { getByText, queryByText } = render(
      <TimeGrid date={day} mode="week" events={short} hourHeight={48} />,
    );
    expect(getByText("Quick")).toBeTruthy();
    // 30 min at 48px/h = 24px box, below the 56px threshold: title only.
    expect(queryByText("09:00 - 09:30")).toBeNull();
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

  it("keeps an event in place when onDragEvent rejects the drop", () => {
    const onDragEvent = jest.fn(() => false);
    const { getByText } = render(
      <TimeGrid date={day} mode="day" events={events} hourHeight={48} onDragEvent={onDragEvent} />,
    );
    const box = wrapperOf(getByText("Focus"));
    fireEvent.pointerDown(box, { clientY: 300, pointerId: 1 });
    fireEvent.pointerMove(box, { clientY: 204, pointerId: 1 });
    fireEvent.pointerUp(box, { clientY: 204, pointerId: 1 });

    expect(onDragEvent).toHaveBeenCalledTimes(1);
    // Controlled: the parent declined, so the event is still rendered (snaps back).
    expect(getByText("Focus")).toBeTruthy();
  });

  // The day column carries the crosshair cursor when create/press is enabled.
  function dayColumn(container: HTMLElement): HTMLElement {
    return container.querySelector<HTMLElement>('[style*="crosshair"]')!;
  }

  it("sweeps out a new event from empty grid space", () => {
    const onCreateEvent = jest.fn();
    const { container } = render(
      <TimeGrid date={day} mode="day" hourHeight={48} onCreateEvent={onCreateEvent} />,
    );
    const col = dayColumn(container);
    // Drag from 0px (00:00) to 96px (02:00) at 48px/hour.
    fireEvent.pointerDown(col, { clientY: 0, pointerId: 1, button: 0 });
    fireEvent.pointerMove(col, { clientY: 96, pointerId: 1 });
    fireEvent.pointerUp(col, { clientY: 96, pointerId: 1 });

    expect(onCreateEvent).toHaveBeenCalledTimes(1);
    const [start, end] = onCreateEvent.mock.calls[0] as [Date, Date];
    expect(start.getHours()).toBe(0);
    expect(end.getHours()).toBe(2);
  });

  it("treats a stationary press on empty space as onPressCell", () => {
    const onPressCell = jest.fn();
    const { container } = render(
      <TimeGrid date={day} mode="day" hourHeight={48} onPressCell={onPressCell} />,
    );
    const col = dayColumn(container);
    fireEvent.pointerDown(col, { clientY: 96, pointerId: 1, button: 0 });
    fireEvent.pointerUp(col, { clientY: 96, pointerId: 1 });

    expect(onPressCell).toHaveBeenCalledTimes(1);
    expect((onPressCell.mock.calls[0][0] as Date).getHours()).toBe(2);
  });

  it("hides the all-day lane when showAllDayEventCell is false", () => {
    const allDay: CalendarEvent[] = [
      { title: "Holiday", start: new Date(2026, 5, 26), end: new Date(2026, 5, 27), allDay: true },
    ];
    const { queryByText, rerender } = render(
      <TimeGrid date={day} mode="day" events={allDay} hourHeight={48} />,
    );
    expect(queryByText("all-day")).toBeTruthy();
    rerender(
      <TimeGrid
        date={day}
        mode="day"
        events={allDay}
        hourHeight={48}
        showAllDayEventCell={false}
      />,
    );
    expect(queryByText("all-day")).toBeNull();
  });
});
