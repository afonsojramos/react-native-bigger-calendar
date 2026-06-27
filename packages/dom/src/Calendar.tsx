import type { Locale } from "date-fns";
import type { CSSProperties } from "react";
import type {
  CalendarEvent,
  DateRange,
  DateSelectionConstraints,
  TimeGridMode,
  WeekStartsOn,
} from "@super-calendar/core";
import { type DomMonthEvent, MonthView } from "./MonthView";
import { type BusinessHours, type DomRenderEvent, TimeGrid } from "./TimeGrid";
import type { DomCalendarTheme } from "./theme";

export interface CalendarProps<T = unknown> extends DateSelectionConstraints {
  /**
   * The view to render (default "week"). `month` renders a single month grid;
   * the others render a time grid. (`schedule`/Agenda is React-Native only.)
   */
  mode?: "month" | TimeGridMode;
  /** Controlled anchor date. Change it (e.g. from your own header) to navigate. */
  date: Date;
  /** Your events. */
  events?: CalendarEvent<T>[];
  /** First day of the week. Sunday = 0 (default) … Saturday = 6. */
  weekStartsOn?: WeekStartsOn;
  /** Column count for `mode="custom"`. */
  numberOfDays?: number;
  locale?: Locale;
  theme?: Partial<DomCalendarTheme>;
  /** Height of the scroll viewport, in px. */
  height?: number | string;
  className?: string;
  style?: CSSProperties;

  /** Tap an event (both layouts). */
  onPressEvent?: (event: CalendarEvent<T>) => void;

  // --- Time-grid modes (week / day / 3days / custom) ---
  /** 12-hour AM/PM time labels (default false). */
  ampm?: boolean;
  /** Initial pixels per hour. */
  hourHeight?: number;
  /** Initial scroll position, in minutes from midnight. */
  scrollOffsetMinutes?: number;
  /** Sub-divisions per hour for the grid lines. */
  timeslots?: number;
  /** Shade the hours outside business hours. */
  businessHours?: BusinessHours;
  /** Show the current-time indicator (default true). */
  showNowIndicator?: boolean;
  /** Show the all-day lane (default true). */
  showAllDayEventCell?: boolean;
  /** Snap dragged/created events to this many minutes. */
  dragStepMinutes?: number;
  /** Tap empty grid space. */
  onPressCell?: (date: Date) => void;
  /** Drag empty grid space to create. */
  onCreateEvent?: (start: Date, end: Date) => void;
  /** Fires when an event drag begins. */
  onDragStart?: (event: CalendarEvent<T>) => void;
  /** Enables drag-to-move/resize; return `false` to reject the drop. */
  onDragEvent?: (event: CalendarEvent<T>, start: Date, end: Date) => void | boolean;
  /** Tap a day's column header. */
  onPressDateHeader?: (day: Date) => void;
  /** Custom time-grid event renderer. */
  renderTimeEvent?: DomRenderEvent<T>;

  // --- Month mode ---
  /** Max chips per day before a "+N more" row. */
  maxVisibleEventCount?: number;
  /** Overflow row template; `{moreCount}` is replaced. */
  moreLabel?: string;
  /** Render neighbouring months' days in the leading/trailing cells (default true). */
  showAdjacentMonths?: boolean;
  /** Fill the cell with the range background instead of the pill band. */
  fillCellOnSelection?: boolean;
  /** Selected span. */
  selectedRange?: DateRange;
  /** Discrete selected days. */
  selectedDates?: Date[];
  /** Tap a day cell. */
  onPressDay?: (date: Date) => void;
  /** Tap the "+N more" overflow row. */
  onPressMore?: (events: CalendarEvent<T>[], date: Date) => void;
  /** Custom month chip renderer. */
  renderMonthEvent?: DomMonthEvent<T>;
}

/**
 * Batteries-included entry point for the react-dom renderer: it picks the right
 * view for `mode`. `month` renders a single {@link MonthView}; the time-grid
 * modes render a {@link TimeGrid}. (There is no `schedule`/Agenda on the web
 * renderer.) For a scrolling month picker, use {@link MonthList} directly.
 */
export function Calendar<T = unknown>({
  mode = "week",
  date,
  events,
  weekStartsOn = 0,
  numberOfDays,
  locale,
  theme,
  height,
  className,
  style,
  onPressEvent,
  // time grid
  ampm,
  hourHeight,
  scrollOffsetMinutes,
  timeslots,
  businessHours,
  showNowIndicator,
  showAllDayEventCell,
  dragStepMinutes,
  onPressCell,
  onCreateEvent,
  onDragStart,
  onDragEvent,
  onPressDateHeader,
  renderTimeEvent,
  // month
  maxVisibleEventCount,
  moreLabel,
  showAdjacentMonths,
  fillCellOnSelection,
  selectedRange,
  selectedDates,
  minDate,
  maxDate,
  isDateDisabled,
  onPressDay,
  onPressMore,
  renderMonthEvent,
}: CalendarProps<T>) {
  if (mode === "month") {
    return (
      <MonthView<T>
        date={date}
        events={events ?? []}
        weekStartsOn={weekStartsOn}
        locale={locale}
        theme={theme}
        className={className}
        style={style}
        maxVisibleEventCount={maxVisibleEventCount}
        moreLabel={moreLabel}
        showAdjacentMonths={showAdjacentMonths}
        fillCellOnSelection={fillCellOnSelection}
        selectedRange={selectedRange}
        selectedDates={selectedDates}
        minDate={minDate}
        maxDate={maxDate}
        isDateDisabled={isDateDisabled}
        onPressDay={onPressDay}
        onPressEvent={onPressEvent}
        onPressMore={onPressMore}
        renderEvent={renderMonthEvent}
      />
    );
  }

  return (
    <TimeGrid<T>
      date={date}
      mode={mode}
      events={events}
      weekStartsOn={weekStartsOn}
      numberOfDays={numberOfDays}
      locale={locale}
      theme={theme}
      height={height}
      className={className}
      style={style}
      ampm={ampm}
      hourHeight={hourHeight}
      scrollOffsetMinutes={scrollOffsetMinutes}
      timeslots={timeslots}
      businessHours={businessHours}
      showNowIndicator={showNowIndicator}
      showAllDayEventCell={showAllDayEventCell}
      dragStepMinutes={dragStepMinutes}
      onPressEvent={onPressEvent}
      onPressCell={onPressCell}
      onCreateEvent={onCreateEvent}
      onDragStart={onDragStart}
      onDragEvent={onDragEvent}
      onPressDateHeader={onPressDateHeader}
      renderEvent={renderTimeEvent}
    />
  );
}
