import type { CSSProperties } from "react";
import type { CalendarEvent, CalendarMode } from "@super-calendar/dom";
import { EventMenuWrapper } from "@super-calendar/example-shared/menu";

// Accepts the common shape of all three renderers' event args (time grid, month
// chip, and schedule row), so the one component can be passed as renderTimeEvent,
// renderMonthEvent, renderScheduleEvent, and MonthList's renderEvent.
type EventArgs = {
  event: CalendarEvent;
  mode?: CalendarMode;
  onPress?: () => void;
  isAllDay?: boolean;
  boxHeight?: number;
};

const hhmm = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

/**
 * Web renderEvent: a titled chip wrapped in the shared base-ui context menu
 * (move / delete). The same menu drives the native example, so right-click
 * behaves identically across both demos. The schedule row shows the time below
 * the title; time-grid boxes show it only when tall enough; month chips stay
 * title-only.
 */
// Chip line metrics, matched to the styles below so the title clamp lands on a
// line boundary: fontSize 12 * lineHeight 1.25 = 15px; the time reserves two
// lines (it can wrap on a narrow column); 2px vertical padding.
const LINE = 15;
const TIME_RESERVE = LINE * 2;
const PAD_Y = 2;

export function EventContextMenu({ event, mode, isAllDay, boxHeight }: EventArgs) {
  const timeText = isAllDay ? "All day" : `${hhmm(event.start)} - ${hhmm(event.end)}`;
  // Time-grid box with a measured height: fill it with whole title lines (no
  // mid-line crop, no ellipsis) and only show the time once a full line is free
  // beneath the title. Matches the built-in renderer's behavior.
  const isTimeGridBox = !isAllDay && mode !== "schedule" && boxHeight !== undefined;
  let titleMaxLines: number | undefined;
  let showTime: boolean;
  if (mode === "schedule") {
    showTime = true;
  } else if (isTimeGridBox) {
    const inner = boxHeight - PAD_Y * 2;
    const wantTime = inner >= 56;
    titleMaxLines = Math.max(1, Math.floor((inner - (wantTime ? TIME_RESERVE : 0)) / LINE));
    showTime = wantTime && inner - titleMaxLines * LINE >= TIME_RESERVE;
  } else {
    showTime = false; // month chip / all-day
  }
  return (
    <EventMenuWrapper event={event}>
      <div
        style={{ ...styles.chip, ...(mode === "schedule" ? styles.scheduleChip : null) }}
        title={event.title}
      >
        <span
          style={
            titleMaxLines !== undefined
              ? { ...styles.chipTitleWrap, maxHeight: titleMaxLines * LINE }
              : styles.chipTitle
          }
        >
          {event.title}
        </span>
        {showTime ? <span style={styles.chipTime}>{timeText}</span> : null}
      </div>
    </EventMenuWrapper>
  );
}

const styles: Record<string, CSSProperties> = {
  chip: {
    height: "100%",
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
    padding: "2px 6px",
    borderRadius: 6,
    background: "#DCE7FF",
    color: "#1A1B1E",
    fontSize: 12,
    lineHeight: 1.25,
  },
  // The schedule row is a roomier card (title + time), matching the native look.
  scheduleChip: { padding: "6px 10px", fontSize: 13 },
  chipTitle: {
    display: "block",
    fontWeight: 600,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  // Time-grid title: wrap to whole lines and clip on a line boundary (no ellipsis).
  chipTitleWrap: {
    display: "block",
    fontWeight: 600,
    overflow: "hidden",
    wordBreak: "break-word",
  },
  chipTime: { display: "block", overflow: "hidden", maxHeight: TIME_RESERVE, opacity: 0.75 },
};
