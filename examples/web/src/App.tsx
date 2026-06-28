import { addDays, addMonths, addWeeks, format } from "date-fns";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  type CalendarEvent,
  getViewDays,
  MonthList,
  useDateRange,
} from "@super-calendar/dom";

import { type EventMenuActions, EventMenuProvider } from "@super-calendar/example-shared";
import { EventContextMenu } from "./EventContextMenu";

type EventMeta = { id: string; kind: "work" | "music" | "health" | "exam" | "social" | "travel" };

// The grid views step by a fixed period (toolbar + letter keys). "schedule" is the
// agenda list, and picker/list are scrolling MonthLists, so they sit outside it.
const MODES = ["month", "week", "3days", "day"] as const;
type CalendarTab = (typeof MODES)[number];
type DemoTab = CalendarTab | "schedule" | "picker" | "list";
const TABS: DemoTab[] = [...MODES, "schedule", "picker", "list"];
const WEEK_STARTS_ON = 1;

// The dom Calendar is fully controlled by `date`, so the example owns navigation.
// Step the anchor by the period the current mode shows.
function stepDate(date: Date, mode: CalendarTab, dir: 1 | -1): Date {
  if (mode === "month") return addMonths(date, dir);
  if (mode === "week") return addWeeks(date, dir);
  if (mode === "3days") return addDays(date, dir * 3);
  return addDays(date, dir);
}

// Label for the visible period, matching exactly what the grid renders.
function periodLabel(date: Date, mode: CalendarTab): string {
  if (mode === "month") return format(date, "MMMM yyyy");
  if (mode === "day") return format(date, "EEE, d MMM yyyy");
  const days = getViewDays(mode, date, WEEK_STARTS_ON);
  const first = days[0];
  const last = days[days.length - 1];
  const sameMonth = first.getMonth() === last.getMonth();
  return sameMonth
    ? `${format(first, "d")} - ${format(last, "d MMM yyyy")}`
    : `${format(first, "d MMM")} - ${format(last, "d MMM yyyy")}`;
}

function isCalendarTab(tab: DemoTab): tab is CalendarTab {
  return (MODES as readonly string[]).includes(tab);
}

function rangeLabel(range: { start: Date; end?: Date | null } | null): string {
  if (!range) return "Tap a start date";
  const start = range.start.toLocaleDateString();
  if (!range.end) return `${start} → tap an end date`;
  return `${start} → ${range.end.toLocaleDateString()}`;
}

function shiftedDate(date: Date, minutes: number): Date {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
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
    // Two all-day events tomorrow, so the all-day lane stacks more than one.
    {
      id: "13",
      kind: "travel",
      title: "🏖️ Bank holiday",
      start: at(1, 0),
      end: at(2, 0),
      allDay: true,
    },
    {
      id: "14",
      kind: "work",
      title: "🎉 Company offsite",
      start: at(1, 0),
      end: at(2, 0),
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

  // Actions the right-click menu performs; matched back to events by id.
  const menuActions = useMemo<EventMenuActions>(
    () => ({
      shift: (event, minutes) =>
        setEvents((prev) =>
          prev.map((e) =>
            e.id === (event as CalendarEvent<EventMeta>).id
              ? { ...e, start: shiftedDate(e.start, minutes), end: shiftedDate(e.end, minutes) }
              : e,
          ),
        ),
      remove: (event) =>
        setEvents((prev) => prev.filter((e) => e.id !== (event as CalendarEvent<EventMeta>).id)),
    }),
    [],
  );

  // Google-Calendar-style keyboard shortcuts: n/j next, p/k previous, t today,
  // and d/w/m/x to switch views. The library is controlled by `date`/`mode`, so
  // these live in the app, just like the toolbar buttons.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? ""))
        return;
      // Leave keys to the context menu while it is open.
      if (document.querySelector('[data-slot="context-menu-content"]')) return;
      switch (e.key.toLowerCase()) {
        case "n":
        case "j":
          if (isCalendarTab(mode)) setDate((d) => stepDate(d, mode, 1));
          break;
        case "p":
        case "k":
          if (isCalendarTab(mode)) setDate((d) => stepDate(d, mode, -1));
          break;
        case "t":
          setDate(new Date());
          break;
        case "d":
          setMode("day");
          break;
        case "w":
          setMode("week");
          break;
        case "m":
          setMode("month");
          break;
        case "x":
          setMode("3days");
          break;
        case "a":
          setMode("schedule");
          break;
        default:
          return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  return (
    <EventMenuProvider value={menuActions}>
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

        {isCalendarTab(mode) ? (
          <div style={styles.navRow}>
            <div style={styles.navButtons}>
              <button
                type="button"
                style={styles.navButton}
                aria-label="Previous"
                onClick={() => setDate((d) => stepDate(d, mode, -1))}
              >
                ‹
              </button>
              <button type="button" style={styles.todayButton} onClick={() => setDate(new Date())}>
                Today
              </button>
              <button
                type="button"
                style={styles.navButton}
                aria-label="Next"
                onClick={() => setDate((d) => stepDate(d, mode, 1))}
              >
                ›
              </button>
            </div>
            <span style={styles.periodLabel}>{periodLabel(date, mode)}</span>
            <span style={styles.hint}>keys: n / p move · t today · d w m x a views</span>
          </div>
        ) : null}

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
              renderEvent={EventContextMenu}
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
              renderTimeEvent={EventContextMenu}
              renderMonthEvent={EventContextMenu}
              renderScheduleEvent={EventContextMenu}
              scrollOffsetMinutes={8 * 60}
              businessHours={(d) => {
                const weekday = d.getDay();
                if (weekday === 0 || weekday === 6) return null; // weekends closed
                return { start: 9, end: 17 };
              }}
              onDragEvent={(event, start, end) => {
                // Exams are locked: returning false rejects the drop (snaps back).
                if (event.kind === "exam") return false;
                setEvents((prev) =>
                  prev.map((e) => (e.id === event.id ? { ...e, start, end } : e)),
                );
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
    </EventMenuProvider>
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
  header: { marginBottom: 4 },
  title: { fontSize: 20, lineHeight: 1.2, margin: 0 },
  subtitle: { margin: 0, color: "#6B7280", fontSize: 14 },
  tabs: { display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 0" },
  tab: {
    padding: "6px 18px",
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
  navRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    paddingBottom: 12,
  },
  navButtons: { display: "flex", gap: 6 },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid #E2E4E9",
    background: "#fff",
    color: "#1A1B1E",
    fontSize: 18,
    lineHeight: 1,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  todayButton: {
    height: 34,
    padding: "0 14px",
    borderRadius: 8,
    border: "1px solid #E2E4E9",
    background: "#fff",
    color: "#1A1B1E",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  periodLabel: { fontWeight: 600, fontSize: 16 },
  hint: { marginLeft: "auto", color: "#9AA1AC", fontSize: 12 },
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
