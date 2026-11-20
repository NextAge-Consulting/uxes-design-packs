---
kind: behaviour
code: [packages/ui/src/hooks/use-delayed-loading.ts, packages/web/src/nav/ScreenOutlet.tsx, packages/ui/src/components/screen-skeleton.tsx, packages/web/src/session/useSignOut.ts, packages/ui/src/components/busy-status.tsx, packages/ui/src/components/option-switch.tsx, packages/web/src/browse/useBrowseData.ts, packages/web/src/components/BrowseTable.tsx, packages/ui/src/components/browse-toolbar.tsx, packages/web/src/components/FormShell.tsx, packages/web/src/components/FormActions.tsx, packages/web/src/components/RowActions.tsx, packages/ui/src/components/row-actions-menu.tsx, packages/ui/src/components/confirm-dialog.tsx, packages/ui/src/components/entity-modal.tsx, packages/ui/src/components/prompt-dialog.tsx, packages/ui/src/components/picker-dialog.tsx, packages/ui/src/components/review-dialog.tsx, packages/ui/src/components/modal-shell.tsx]
block-types: cross-cutting
ui-status: approved
---

# Loading states

A region on its first load shows skeletons; a browse keeps its rows and shows one
spinner after Filters; a control that writes shows a spinner and goes busy; every indicator
is gated against flashing. The kit's universal rules are
`mfing-bible-of-tanstack/references/loading-states.md`; this file is how they apply here.

## When it applies

Every read that replaces what is on screen, and every action that writes.

## Always gated

Every loading indicator goes through `useDelayedLoading`.

## Browses — the rows stay, a spinner after Filters

- A sort or page change keeps the toolbar, the header and the current rows in place until
  the new rows arrive; a search or filter change keeps the toolbar and the header and shows
  placeholder rows until its rows arrive, so no row of the old filter sits under the new one. `BrowseToolbar` shows a spinner and "Loading" after
  its Filters button, never on the Search button or the control that was pressed.
- The signal is the list's own reads: `useBrowseData`'s `loading`, passed to the toolbar
  as `searching`. A page change cut from rows already in hand shows nothing.

## Moving to another screen — its outline at once

- A click that goes to another screen shows that screen's outline in placeholders, in
  the shell, until its data arrives
  (`ScreenOutlet`, `ScreenSkeleton`). A list changing its own page, filter or sort is not
  moving and keeps its rows.

## Actions that write — spinner on the control

- Save, and every action that writes, shows a spinner in the `BusySlot` of the button that
  was pressed.
- The label does not change, except on a slow third-party write, where a bare spinner at
  two or three seconds reads as a click that did not register.
- The button goes busy, never disabled: disabled is reserved for unavailable — nothing to
  save, no permission.
- The state is announced in a `BusyStatus` beside the control, never with `aria-busy`.
- `Close` is a plain navigation and gets nothing.

## Excluded

- No progress bar on a request.
- No full-page spinner.
- No route-level pending component on a browse.
