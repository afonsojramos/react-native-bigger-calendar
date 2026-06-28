import { type CSSProperties, useMemo, useState } from "react";
import { Calendar, type CalendarEvent, MonthList, useDateRange } from "@super-calendar/dom";

// Freeze the clock so the demo always renders the same scene (events, the "today"
// highlight, and the now line anchor to Tue 23 June 2026, 10:01), matching the
// native example. Delete this block to follow the real clock.
const MOCK_NOW = new Date(2026, 5, 23, 10, 1, 0).getTime();
globalThis.Date = new Proxy(Date, {
  construct: (target, args) => Reflect.construct(target, args.length === 0 ? [MOCK_NOW] : args),
  get: (target, prop, receiver) =>
    prop === "now" ? () => MOCK_NOW : Reflect.get(target, prop, receiver),
}) as DateConstructor;

type EventMeta = { id: string; kind: "work" | "music" | "health" | "exam" | "social" | "travel" };

// dom has no Agenda, so "schedule" isn't offered; the rest mirror the native demo.
const MODES = ["month", "week", "3days", "day"] as const;
type DemoTab = (typeof MODES)[number] | "picker" | "list";
const TABS: DemoTab[] = [...MODES, "picker", "list"];

function rangeLabel(range: { start: Date; end?: Date | null } | null): string {
  if (!range) return "Tap a start date";
  const start = range.start.toLocaleDateString();
  if (!range.end) return `${start} → tap an end date`;
  return `${start} → ${range.end.toLocaleDateString()}`;
}

// Events anchored to "today" so the demo is always populated, matching the
// native example.
function buildEvents(): CalendarEvent<EventMeta>[] {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const at = (offsetDays: number, hour: number, minute = 0) => {
    const d = new Date(base);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, minute, 0, 0);
    return d;
  };
  return [
    { id: "11", kind: "social", title: "☕ Coffee with Alex", start: at(0, 8), end: at(0, 8, 30) },
    { id: "1", kind: "work", title: "👥 Team standup", start: at(0, 9), end: at(0, 9, 30) },
    { id: "2", kind: "health", title: "🦷 Dentist", start: at(0, 11), end: at(0, 11, 45) },
    {
      id: "3",
      kind: "social",
      title: "🥪 Lunch with Sam",
      start: at(0, 12, 30),
      end: at(0, 13, 30),
    },
    { id: "4", kind: "music", title: "🎸 King Gizzard", start: at(0, 19), end: at(0, 23) },
    { id: "5", kind: "exam", title: "🚗 Driving theory exam", start: at(1, 9), end: at(1, 10, 30) },
    { id: "6", kind: "health", title: "🩺 GP appointment", start: at(1, 15), end: at(1, 15, 30) },
    { id: "7", kind: "health", title: "💪 Physio", start: at(2, 10), end: at(2, 10, 45) },
    { id: "8", kind: "work", title: "📊 Project review", start: at(2, 14), end: at(2, 15) },
    { id: "12", kind: "health", title: "🏋️ Gym", start: at(0, 16), end: at(0, 17) },
    { id: "9", kind: "travel", title: "✈️ Lisbon trip", start: at(3, 17), end: at(5, 21) },
    {
      id: "10",
      kind: "social",
      title: "🎂 Mum's birthday",
      start: at(0, 0),
      end: at(1, 0),
      allDay: true,
    },
  ];
}

export function App() {
  const [mode, setMode] = useState<DemoTab>("week");
  const [date, setDate] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent<EventMeta>[]>(buildEvents);
  const pickerMinDate = useMemo(() => new Date(), []);
  const { range, onPressDate, reset } = useDateRange({ minDate: pickerMinDate });

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>@super-calendar/dom</h1>
        <p style={styles.subtitle}>
          The react-dom renderer — no React Native, no react-native-web.
        </p>
      </header>

      <nav style={styles.tabs}>
        {TABS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            style={{ ...styles.tab, ...(mode === m ? styles.tabActive : null) }}
          >
            {m}
          </button>
        ))}
      </nav>

      {mode === "picker" ? (
        <div style={styles.pickerCard}>
          <div style={styles.pickerBar}>
            <span style={styles.pickerLabel}>{rangeLabel(range)}</span>
            <button type="button" style={styles.clearButton} onClick={reset}>
              Clear
            </button>
          </div>
          <MonthList
            date={date}
            weekStartsOn={1}
            selectedRange={range ?? undefined}
            minDate={pickerMinDate}
            onPressDay={onPressDate}
            height={460}
          />
        </div>
      ) : mode === "list" ? (
        <div style={styles.card}>
          <MonthList
            date={date}
            events={events}
            weekStartsOn={1}
            onPressEvent={(event) => console.log("press event:", event.title)}
            onPressDay={(day) => console.log("press day:", day.toDateString())}
            onPressMore={(dayEvents, day) =>
              console.log("more:", day.toDateString(), dayEvents.length)
            }
            height={560}
          />
        </div>
      ) : (
        <div style={styles.card}>
          <Calendar
            mode={mode}
            date={date}
            events={events}
            weekStartsOn={1}
            height={560}
            scrollOffsetMinutes={8 * 60}
            businessHours={(d) => {
              const weekday = d.getDay();
              if (weekday === 0 || weekday === 6) return null; // weekends closed
              return { start: 9, end: 17 };
            }}
            onDragEvent={(event, start, end) => {
              // Exams are locked: returning false rejects the drop (snaps back).
              if (event.kind === "exam") return false;
              setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, start, end } : e)));
            }}
            onCreateEvent={(start, end) =>
              setEvents((prev) => {
                const nextId = String(Math.max(0, ...prev.map((e) => Number(e.id) || 0)) + 1);
                return [...prev, { id: nextId, kind: "work", title: "✨ New event", start, end }];
              })
            }
            onPressEvent={(event) => console.log("press event:", event.title)}
            onPressDay={(day) => {
              setDate(day);
              setMode("day");
            }}
            onPressMore={(dayEvents, day) =>
              console.log("more:", day.toDateString(), dayEvents.length)
            }
            onPressCell={(at) => console.log("create at:", at.toISOString())}
          />
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  app: {
    maxWidth: 900,
    margin: "0 auto",
    padding: 16,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    color: "#1A1B1E",
  },
  header: { marginBottom: 12 },
  title: { fontSize: 20, margin: "0 0 2px" },
  subtitle: { margin: 0, color: "#6B7280", fontSize: 14 },
  tabs: { display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 0 16px" },
  tab: {
    padding: "8px 18px",
    borderRadius: 8,
    border: "none",
    background: "#eef0f3",
    color: "#1A1B1E",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    textTransform: "capitalize",
    fontFamily: "inherit",
  },
  tabActive: { background: "#1F6FEB", color: "#fff" },
  card: { border: "1px solid #E2E4E9", borderRadius: 14, overflow: "hidden" },
  pickerCard: {
    maxWidth: 460,
    border: "1px solid #E2E4E9",
    borderRadius: 14,
    overflow: "hidden",
  },
  pickerBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    borderBottom: "1px solid #eef0f3",
  },
  pickerLabel: { fontWeight: 600, fontSize: 15 },
  clearButton: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "none",
    background: "#eef0f3",
    color: "#1F6FEB",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
