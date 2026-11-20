---
kind: recipe
frame: ModuleLanding
block-types: [ModuleLanding]
ui-status: approved
---

# Module landing

A module's entry screen is one `ModuleLanding`: the module's icon and name over what the
module holds.

## When it applies

Home, and the index route of every module on the rail.

## Slots

1. **Icon and title** — the module's icon and name from the app's own list of modules, the
   one its rail is built from, never picked on the screen.
2. **Body** — the module's short description, as body text.
3. **Notice** — present · absent. Present on a module with no screens: it says so.

The route renders `ModuleLanding` from the module's entry in that list and nothing else.

## Exceptions

A screen departs from a choice above only as an exception, with the human's reason where
it is made (`design-accepted — <reason>`).
