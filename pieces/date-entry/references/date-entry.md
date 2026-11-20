---
kind: behaviour
code: [packages/ui/src/components/date-segments.tsx, packages/ui/src/components/date-field.tsx, packages/ui/src/components/time-field.tsx, packages/ui/src/components/ui/calendar.tsx]
block-types: cross-cutting
ui-status: approved
---

# Date entry

**Enter every date with `DateField`, every from–to pair with `DateRange`, every time of
day with `TimeField`, and every date with its time with `DateTimeField`.**

## How to build it

- Pass `label`, the words of the field's visible label: it names the control for
  assistive technology.
- Pass `minuteStep` (5, 10, 15 or 30) where times fall only on those minutes: the picker
  offers only them, ↑/↓ step by them, and a minute typed between them moves to the
  nearest as the minute is left.
- Pass `clearable` only where the value may be empty — a filter bound, an optional date;
  on a `DateRange`, per end where only one may be.
- Name a range once, on its first end: a `DateRange` labelled "Started" reads
  "Started From | To", its group carrying the name for a screen reader. A record whose
  ends have their own names gives them through `ends` — "First Day" and "Last Day".
- Exchange values as strings with no zone: `YYYY-MM-DD`, `HH:MM` on the 24-hour clock,
  `YYYY-MM-DDTHH:MM`.
- Give `DateTimeZone` the company's zone once, at each app's root; the calendar's Today
  reads it.

## What the controls do

- Typing is the way in: segments reading `mm/dd/yyyy` and `hh:mm AM` in every browser; a
  click selects a segment and typing replaces it.
- A partly typed value shows invalid and passes on no value.
- The calendar opens from the field's button: « ‹ › » for a year or a month either way,
  a month list and a year list, then Clear and Today. Picking a day closes it.
- The time picker is headed hour, minute and AM/PM columns, then Clear, Now and Done. It
  stays open on a pick; Enter keeps the time, Escape puts back the time it opened on.
- A To before its From shows both ends invalid, with "The To date is before the From
  date." under the pair.
- A date or a time alone in a `DateTimeField` shows the missing half invalid.

## Excluded

- No `<input type="date">` or `type="time"`.
- No typed shortcuts such as `t` or `+3`.
- No two-month range calendar.
