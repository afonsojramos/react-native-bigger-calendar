import type { CalendarMode } from "../types";

/**
 * Minimum event-box height (px) before the built-in renderer shows the time line
 * on a narrow multi-column timed grid. Tied to the default theme's font sizes.
 */
export const MIN_BOX_HEIGHT_FOR_TIME = 56;

/** Hard-clip an overflowing title by default; opt into a trailing ellipsis. */
export function titleEllipsizeMode(ellipsizeTitle: boolean): "clip" | "tail" {
  return ellipsizeTitle ? "tail" : "clip";
}

/**
 * Month cells and the all-day lane show a single clipped line; timed-grid titles
 * (`undefined`) wrap to fill the box.
 */
export function titleNumberOfLines(mode: CalendarMode, isAllDay: boolean): number | undefined {
  return mode === "month" || isAllDay ? 1 : undefined;
}

/** The built-in renderer shows the time range on timed events only — never month cells or all-day chips. */
export function shouldShowEventTime(
  mode: CalendarMode,
  isAllDay: boolean,
  showTime: boolean,
): boolean {
  return mode !== "month" && !isAllDay && showTime;
}

/**
 * Whether the time line fits in the box. The wide `day` column and contexts with
 * no live box height (e.g. schedule, where `boxHeightPx` is undefined) always
 * show it; narrow multi-column modes only once the box is at least
 * {@link MIN_BOX_HEIGHT_FOR_TIME} tall. Runs on the UI thread inside the event
 * renderer's animated style.
 */
export function isTimeVisibleAtHeight(
  boxHeightPx: number | undefined,
  mode: CalendarMode,
): boolean {
  "worklet";
  if (boxHeightPx == null || mode === "day") return true;
  return boxHeightPx >= MIN_BOX_HEIGHT_FOR_TIME;
}
