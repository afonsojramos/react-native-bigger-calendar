import { useMemo } from "react";
import { type CalendarEvent, MonthList, TimeGrid, useDateRange } from "@super-calendar/dom";

function buildEvents(): CalendarEvent[] {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const at = (days: number, h: number, m = 0) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    d.setHours(h, m, 0, 0);
    return d;
  };
  return [
    { title: "Standup", start: at(0, 9), end: at(0, 9, 30) },
    { title: "Design review", start: at(0, 9, 15), end: at(0, 10, 30) },
    { title: "Lunch with Sam", start: at(0, 12, 30), end: at(0, 13, 30) },
    { title: "Conference", start: at(0, 0), end: at(1, 0), allDay: true },
    { title: "Focus block", start: at(2, 14), end: at(2, 16) },
  ];
}

export function App() {
  const today = useMemo(() => new Date(), []);
  const events = useMemo(buildEvents, []);
  const { range, onPressDate, reset } = useDateRange({ minDate: today });

  return (
    <div style={{ maxWidth: 820, margin: "24px auto", padding: "0 16px", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 20 }}>@super-calendar/dom</h1>
      <p style={{ color: "#6b7280" }}>
        The react-dom renderer. No React Native, no react-native-web.
      </p>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}>
        <TimeGrid date={today} mode="week" weekStartsOn={1} events={events} height={480} />
      </div>

      <div style={{ height: 24 }} />

      <div
        style={{ maxWidth: 460, border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 14px",
            borderBottom: "1px solid #eef0f3",
          }}
        >
          <span style={{ fontWeight: 600 }}>
            {range
              ? `${range.start.toLocaleDateString()} → ${range.end?.toLocaleDateString() ?? "…"}`
              : "Pick a range"}
          </span>
          <button type="button" onClick={reset}>
            Clear
          </button>
        </div>
        <MonthList
          date={today}
          minDate={today}
          weekStartsOn={1}
          selectedRange={range ?? undefined}
          onPressDay={onPressDate}
          height={420}
        />
      </div>
    </div>
  );
}
