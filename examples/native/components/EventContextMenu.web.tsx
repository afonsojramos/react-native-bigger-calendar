import "@super-calendar/example-shared/global.css";
import { DefaultEvent, type RenderEventArgs } from "@super-calendar/native";
import { EventMenuWrapper } from "@super-calendar/example-shared/menu";

/**
 * Web renderEvent: wraps the built-in event in the shared base-ui context menu.
 * Right-click an event to move or delete it. The menu UI is shared with the dom
 * example (see examples/shared), showing you can drop in any menu library.
 */
export function EventContextMenu(props: RenderEventArgs) {
  return (
    <EventMenuWrapper event={props.event}>
      <DefaultEvent {...props} />
    </EventMenuWrapper>
  );
}
