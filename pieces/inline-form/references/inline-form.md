---
kind: behaviour
code: [packages/ui/src/components/field.tsx, packages/web/src/form/useFocusOnOpen.ts, packages/web/src/form/UnsavedChangesGuard.tsx]
block-types: [SettingsScreen, FieldGroup]
ui-status: approved
---

# Inline form

A container shows its values; its Change button turns that container into its form, in the
same place, with its own Save and Cancel. Saving, its state and its failures follow
`saving.md`.

## When it applies

A container holding a few values edited together — a settings card (an email, a password,
a mailing address), or a table row that expands into a form. Not:

- a collection of records (saved addresses) — add and edit in an `EntityModal`;
- a single on/off — a switch (`boolean-fields.md`);
- a change that needs terms read or a consequence confirmed — a `ReviewDialog` or
  `ConfirmDialog` (`confirm-before-write.md`);
- a record with more than a few fields — its own screen (`browse-layout.md`,
  `form-layout.md`).

## Viewing

- The container shows its values as `Fact`s in a `FactList` and ends in its actions,
  `FieldStackActions layout="inline"`.
- Each action is an outline button named for what it changes — `Change Email`,
  `Change Mailing Address`, `Change Password` — never a bare `Edit`.

## Editing

- Change replaces the facts with the form; the container stays where it is.
- The form starts from the current values. Cancel discards what was typed and brings the
  facts back.
- The form ends in its own `FieldStackActions layout="inline"`: the primary first, then
  `Cancel`. The primary is `Save`, or the action's name when it does more than store a
  value — `Change Password`.
- One form per container at a time: while one is open, the container's other actions are
  hidden. Containers are independent of each other.
- Change moves focus to the form's first field, through `useFocusOnOpen`; Save and Cancel
  return it to the Change button.

## Saving

- A save returns the container to its facts. A change that is simply done shows its new
  value and nothing else; one with a next step, or worth confirming, says so in an `Alert`
  inside the container — a code sent to confirm a new email, a password changed.
- Leaving the screen with a form open and changed asks first (`UnsavedChangesGuard`).

## Excluded

- No save for the whole screen.
