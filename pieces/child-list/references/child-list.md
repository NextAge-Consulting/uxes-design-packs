---
kind: behaviour
code: [packages/web/src/components/ChildList.tsx, packages/web/src/browse/useChildPaging.ts]
block-types: [DataTable, Pager]
ui-status: approved
---

# Child lists

A list of one record's rows — an order's lines, an invoice's payments, who acknowledged a
message — sits on the record as a child list: the same table as a browse, slimmed to
what a list already scoped to its parent needs.

## What it keeps from a browse

- **The same `BrowseTable`**: sort by heading, resize, the column chooser saved for the
  person, the pinned actions column with `RowActions`, ↑ ↓ and Enter, back to the row
  last opened, the empty and failure states (`browse-columns.md`, `sortable-columns.md`).
- **The same loading**: a `BrowseSource` read through `useBrowseData`, server blocks and
  a count (`browse-paging.md`). The parent's key travels in the source's filter.
- **The same loading sign**, `BrowseLoading`, fed `useBrowseData`'s `loading`: before
  the card's actions on a record, at the top right above the table in a dialog
  (`loading-states.md`).

## What it leaves out

- **No toolbar**: no search, no Filters, no chips, no view tabs. The parent already says
  whose rows these are.
- **No fit to the window**: it pages by a fixed size, 10 to start, with 10, 25, 50 and
  100 in the rows selector and no Fit (`useChildPageSize`, `childPager`). The size the
  person chooses is kept in their browser, per list. The pager shows only when there are
  more rows than the smallest page.

## Where it sits

- **On a record**: `ChildList` — a card titled with the list's name, the card's own
  actions in its header (a report of the whole list, Add), the table with `inCard` edge to
  edge under the header's rule, and the pager in a ruled footer. Its page and sort go in
  the record's search, so a row's way back returns to them.
- **In a dialog**: the `BrowseTable` in its own frame, then `BrowsePager`, inside the
  dialog's shell. Its page and sort live in the dialog.
