---
kind: recipe
frame: dashboard-screen
block-types: [DashboardScreen]
ui-status: approved
---

# Dashboard screen

A read-only summary screen is a `DashboardScreen` holding, in order, its heading, the choices
that decide what it shows, and its cards. Loading is `loading-states.md`.

## When it applies

A screen that shows figures, charts and tables about one subject and edits nothing.

## Slots

1. **Heading** — `PageHeading` with a title and a description.
   - Screen action: present · absent. Present, it is one `outline` `Button` on the
     heading's row, at its far end.
2. **Choices** — present · absent. `FieldCard`s in a `FieldCardGrid`, one per group of
   choices. Every change redraws the cards below; there is no Apply.
3. **Cards** — a `Card` per chart, figure set or report, and a `TableFrame` for a table
   that is its own surface.
   - While the choices' result loads, the cards it fills show `Skeleton`s, gated by
     `useDelayedLoading`.
   - When it fails, an `ErrorState` takes the cards' place.

## Nothing to show

The heading with no description, then one `EmptyState`. No choices and no cards.

## Exceptions

A screen departs from a choice above only as an exception, with the human's reason where
it is made (`design-accepted — <reason>`).
