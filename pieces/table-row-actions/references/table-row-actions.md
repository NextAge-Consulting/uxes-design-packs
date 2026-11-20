---
kind: behaviour
code: [packages/web/src/components/RowActions.tsx, packages/ui/src/components/confirm-dialog.tsx, packages/ui/src/components/row-actions-menu.tsx, packages/ui/src/components/icon-button.tsx, packages/web/src/components/IconLink.tsx, packages/ui/src/components/table-frame.tsx, packages/ui/src/components/ui/table.tsx]
block-types: [Row, RowActions]
ui-status: approved
---

# Table row actions

First decide whether an action belongs on the row at all; then a standard action is an
icon with a tooltip, and a one-off action is words.

## On the row, or in the overflow menu — decide first

- **The row carries only the actions someone runs routinely** — every cycle, by the
  person the list is for.
- **Everything run at setup, occasionally, or to look something up goes in the row's
  overflow menu** (`RowActionsMenu`).
- **Frequency decides it** — never importance, never consequence.
- A worded button beside the overflow trigger is not a mixed action group.

## Standard or one-off — decide second

- **Standard** — an action that recurs across many lists (view, edit, report, download
  a file, delete): icon only, through `IconButton` or `IconLink`.
- **One-off** — an action specific to this screen ("Import price list"): words, a
  `Button`.
- Neither the verb nor the consequence decides it; whether the action recurs across
  lists does. Downloading a file is standard; downloading a file and applying its
  contents is a one-off.

## One icon vocabulary

Every list in an internal app ends its rows with `RowActions`: the icons its rows
offer, in this order, then the overflow menu. A row that offers none has no actions
column. A public-facing app's lists carry none.

| Action | Control |
|---|---|
| View | `Eye`, quiet |
| Edit | `Pencil`, quiet |
| Open a report, in a new tab | `FileText`, quiet |
| Download a file | `Download`, quiet |
| Delete | `Trash2`, `ghost-destructive` |
| Confirm an inline edit | `Check`, ghost |
| Cancel an inline edit | `X`, ghost |

- **Never pair a standard icon with its own word**, and never present two peer actions
  as different kinds — both icons or both words.
- An icon carrying the verb a noun label drops (`↓ Price Lists`) sits in the control's
  reserved spinner slot, and is not that pairing.
- A busy spinner in a control's reserved slot is state, not a second action.
- **Delete carries the destructive colour, always**, as `ghost-destructive`, never a
  filled red button.
- **Every icon-only control goes through `IconButton` or `IconLink`**, never a raw
  `Button` with an icon child.
- **Label the action and the row**: `Delete Draft 3`, not `Delete`.

## Confirming a delete

Every delete asks first in a `ConfirmDialog`, which says what else the delete removes.

## A table that is the surface goes in a `TableFrame`

A table already inside a `Card` or a panel gets no second frame. No screen styles a
table header; `TableHeader` carries its band and its stickiness.

## Excluded

- Confirming a delete in the row.
