// Shared presentation decisions: turn a day's selection state into a render
// "intent" both renderers map to their own primitives (CSS for dom, StyleSheet
// for native). Keeping the decision here means the pill/fill/badge rules can't
// drift between the two renderers — they were duplicated once and that's exactly
// the bug this prevents.

/** Which range-band shape a day shows. */
export type RangeBandKind = "none" | "fill" | "pill-start" | "pill-mid" | "pill-end";

/** The band shape for a day, given the fill-cell option. */
export function rangeBandKind(
  day: { isInRange: boolean; isRangeStart: boolean; isRangeEnd: boolean },
  fillCell: boolean,
): RangeBandKind {
  // A single-day range (start === end) is the badge alone, no band.
  if (!day.isInRange || (day.isRangeStart && day.isRangeEnd)) return "none";
  if (fillCell) return "fill";
  if (day.isRangeStart) return "pill-start";
  if (day.isRangeEnd) return "pill-end";
  return "pill-mid";
}

/** Whether a band shape rounds its leading / trailing edge (pill ends). */
export function bandRounding(kind: RangeBandKind): { start: boolean; end: boolean } {
  return { start: kind === "pill-start", end: kind === "pill-end" };
}

/** Which filled badge a day shows (today wins over a selection). */
export type DayBadgeKind = "none" | "today" | "selected";

/**
 * The filled-badge kind for a day. `isSelected` is true for both range endpoints
 * and discrete selected days; today always wins when it coincides.
 */
export function dayBadgeKind(day: { isSelected: boolean }, isToday: boolean): DayBadgeKind {
  if (isToday) return "today";
  if (day.isSelected) return "selected";
  return "none";
}
