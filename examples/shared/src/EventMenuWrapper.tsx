import type { ReactNode } from "react";
import type { CalendarEvent } from "@super-calendar/core";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "./ContextMenu";
import { useEventMenuActions } from "./EventMenu";

/**
 * Wraps a rendered event in a base-ui right-click menu (move / delete). Shared by
 * both examples: each passes its own event element as `children`, so the same menu
 * drives the react-dom and react-native-web demos. The calendars ship no menu of
 * their own; this lives in the examples to show you can drop in any library.
 *
 * Web-only (base-ui is DOM-only), so it is imported only from web entry points:
 * the dom example directly, and the native example's `.web.tsx` variant.
 */
export function EventMenuWrapper({
  event,
  children,
}: {
  event: CalendarEvent;
  children: ReactNode;
}) {
  const actions = useEventMenuActions();
  if (!actions) return <>{children}</>;
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-full grow basis-auto">{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => actions.shift(event, -30)}>
          Move 30 min earlier
        </ContextMenuItem>
        <ContextMenuItem onClick={() => actions.shift(event, 30)}>
          Move 30 min later
        </ContextMenuItem>
        <ContextMenuItem onClick={() => actions.shift(event, 60)}>
          Move 1 hour later
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onClick={() => actions.remove(event)}>
          Delete event
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
