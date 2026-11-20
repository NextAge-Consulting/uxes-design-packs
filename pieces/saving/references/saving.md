---
kind: behaviour
code: [packages/web/src/components/FormActions.tsx, packages/web/src/components/FormShell.tsx, packages/web/src/components/fields.tsx, packages/web/src/form/UnsavedChangesGuard.tsx, packages/web/src/form/useSaveShortcut.ts, packages/ui/src/components/field.tsx, packages/ui/src/components/entity-modal.tsx, packages/ui/src/components/prompt-dialog.tsx]
block-types: cross-cutting
ui-status: approved
---

# Saving

Every form is a TanStack Form in a real `<form>`, saving through its container's save
part, gated on a real change, its state in words beside the control, a failure in a box
directly above it, and its unsaved work protected by a navigation guard.

## When it applies

Every surface that edits something, in a page, a dialog or a card.

## The form

- Every surface that edits something is a TanStack Form inside a real `<form>` element,
  preferences included. A screen keeping its own state is a defect.
- `defaultValues` come from data that already exists. Build the form in a child component
  that mounts once the data is there, so `defaultValues` is never `{}` and nothing is
  seeded afterwards.
- The save is always a submit. A screen that seems to need a choice of how the save fires
  is a screen off the form library: fix the screen.

## The save part

- A form saves through its container's part: `FormActions` on a page, `EntityModal`'s or
  `PromptDialog`'s footer in a dialog, `FieldStackActions` in a card.
- An edit form gates on its values differing from what is saved — `!isDefaultValue`, never
  `isDirty`. Validity alone is not the gate.
- Save is disabled only when there is nothing to save; while it runs it is busy
  (`loading-states.md`).
- The state is stated in words beside the control, in a live region: unsaved, saving,
  saved, failed.

## The words

| Outcome | Label | Spoken while busy |
|---|---|---|
| Commit the edits and stay | `Save` | `Saving…` |
| Create the record | `Create <thing>` | `Creating…` |
| Perform an action | its name — `Change Password`, `Send Test` | `Changing…`, `Sending…` |
| Leave, writing nothing | `Close` | — |

- The same outcome gets the same word everywhere: `Save`, never `Save Changes`.
- An action saves with `mode="action"`: no dirty gate, no unsaved-changes line.
- `Cancel` always means discard. A record form leaves with `Close`, never `Cancel`.
- Two buttons, never `Apply` / `OK` / `Cancel`. `Save and continue` belongs to a linear
  multi-page flow, never to record editing.

## When it fails

<!-- design-accepted — the destructive variant is the failure box: the danger-feedback colours, announced as an alert -->
- A failed save or action is the save part's `failure`: a destructive `Alert` directly
  above its buttons, in words for the person, on every form whatever its length. Never at
  the top of the form, never a line beside the buttons.
- An action with no button row — a switch, a row's delete — puts its failure in an `Alert`
  under that switch or list.
- A field's own problem shows under that field as its `FieldError`, the field marked
  `aria-invalid`. When Save finds one, focus moves to the first such field.
- On a form of more than one field, a message from the server is the `failure`, never a
  field's.

## Unsaved work

- Every form that can be left with changes renders `UnsavedChangesGuard`: leaving the
  screen asks first, and closing the tab gets the browser's own prompt.
- Ctrl/Cmd+S saves, through `useSaveShortcut`, while there is something to save and
  nothing saving.

## Excluded

- No sticky or fixed action bar.
