/**
 * The picker-only entry point for `@super-calendar/native`: the month grid,
 * selection, and the headless grid, with no dependency on the timetable views or
 * Reanimated.
 *
 * Import from `@super-calendar/native/picker` for a lighter bundle that does not
 * require react-native-reanimated. The main entry re-exports everything here.
 *
 * @example
 * ```tsx
 * import { MonthView } from "@super-calendar/native/picker";
 * ```
 *
 * @see https://super-calendar.afonsojramos.me
 *
 * @module
 */
export { MonthView, type MonthViewProps } from "./components/MonthView";
export { MonthPager, type MonthPagerProps } from "./components/MonthPager";
export { MonthList, type MonthListProps } from "./components/MonthList";
export { DefaultMonthEvent } from "./components/DefaultMonthEvent";
export {
  type CalendarTheme,
  type PartialCalendarTheme,
  defaultTheme,
  darkTheme,
  mergeTheme,
  CalendarThemeProvider,
  useCalendarTheme,
} from "./theme";
export type {
  CalendarEvent,
  CalendarMode,
  EventKeyExtractor,
  ICalendarEvent,
  RenderEvent,
  RenderEventArgs,
  WeekStartsOn,
} from "./types";
export {
  type DateRange,
  type DateSelectionConstraints,
  type DaySelectionState,
  type UseDateRangeOptions,
  daySelectionState,
  isDateSelectable,
  isRangeEndpoint,
  isWithinDateRange,
  nextDateRange,
  useDateRange,
} from "@super-calendar/core";
export {
  buildMonthGrid,
  type MonthGrid,
  type MonthGridDay,
  type MonthGridWeek,
  type MonthGridWeekday,
  type UseMonthGridOptions,
  useMonthGrid,
} from "@super-calendar/core";
export {
  buildMonthWeeks,
  getWeekDays,
  getIsToday,
  isWeekend,
  isSameCalendarDay,
  minutesIntoDay,
} from "@super-calendar/core";
