# @super-calendar/dom

[![JSR](https://jsr.io/badges/@super-calendar/dom)](https://jsr.io/@super-calendar/dom) [![JSR score](https://jsr.io/badges/@super-calendar/dom/score)](https://jsr.io/@super-calendar/dom)

The react-dom renderer for [super-calendar](https://github.com/afonsojramos/react-native-super-calendar): a virtualized **month / week / day** calendar and date picker built from real DOM components. No React Native, no react-native-web.

It is built on the headless [`@super-calendar/core`](https://jsr.io/@super-calendar/core) and Legend List's DOM renderer.

## Install

```sh
# Deno
deno add jsr:@super-calendar/dom

# npm / pnpm / yarn / bun
npx jsr add @super-calendar/dom
pnpm dlx jsr add @super-calendar/dom
bunx jsr add @super-calendar/dom
```

Peer dependencies: `@legendapp/list` (>=3), `date-fns` (>=3), `react` (>=19), and `react-dom` (>=19).

## Usage

```tsx
import { useState } from "react";
import { Calendar, type CalendarEvent } from "@super-calendar/dom";

type MyEvent = { id: string; color: string };

const events: CalendarEvent<MyEvent>[] = [
  {
    id: "1",
    color: "#1F6FEB",
    title: "Lecture",
    start: new Date(2026, 5, 19, 10, 0),
    end: new Date(2026, 5, 19, 11, 30),
  },
];

export function MyCalendar() {
  const [date, setDate] = useState(new Date());

  return (
    <Calendar
      mode="week"
      date={date}
      events={events}
      weekStartsOn={1}
      onPressDay={setDate}
      onPressEvent={(event) => console.log(event.id)}
    />
  );
}
```

For a custom picker, pair the headless hooks (`useDateRange`, `useMonthGrid`) with `MonthList` and `TimeGrid`, all re-exported from this package.

## Documentation

See the [full documentation](https://super-calendar.afonsojramos.me), the [quickstart](https://super-calendar.afonsojramos.me/quickstart), and the [API reference](https://super-calendar.afonsojramos.me/reference/api).

## License

MIT
