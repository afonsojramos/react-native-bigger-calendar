import { createContext, useContext } from "react";
import type { CalendarEvent } from "@super-calendar/core";

/** Actions the examples' right-click menu performs on an event. */
export type EventMenuActions = {
  shift: (event: CalendarEvent, minutes: number) => void;
  remove: (event: CalendarEvent) => void;
};

const EventMenuContext = createContext<EventMenuActions | null>(null);

export const EventMenuProvider = EventMenuContext.Provider;
export const useEventMenuActions = () => useContext(EventMenuContext);
