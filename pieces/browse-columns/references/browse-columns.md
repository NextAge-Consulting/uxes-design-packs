---
kind: behaviour
code: [packages/web/src/components/BrowseTable.tsx, packages/web/src/components/ColumnSettings.tsx, packages/web/src/browse/browseSettings.ts, packages/web/src/browse/useBrowseSettings.ts, packages/web/src/browse/browseReturn.ts]
block-types: [DataTable, ColumnChooser]
ui-status: approved
---

# Browse columns

A person arranges a list's columns — order, which show, their widths and the sort — and
the list remembers it for them, on the server, per list.

## What the person can do

- **Sort by a heading** (`sortable-columns.md`).
- **Size a column by dragging its heading's right edge**, or focusing the heading and
  pressing ← →.
- **Show, hide and reorder columns from the button at the end of the header**, over the
  rows' actions: a checkbox per column, a handle and up and down buttons to move it, and
  Restore Defaults.
- **Move between rows with ↑ ↓ and open one with Enter**; a row that expands in place
  opens or closes on Enter instead.

## How the columns behave

- **A column moves only when the person moves it.** Showing a hidden column puts it back
  where it stands in their order; hiding one moves nothing else.
- **The actions column stays pinned at the table's right edge** while a wide table scrolls
  under it, so the column button and each row's actions never move.
- **A column the list shows on its own — an owner's ID on a list across every owner — is `automatic`**,
  ahead of the person's columns, and never in the column chooser.
- **A list declares its columns, their default order, which start hidden, its sortable
  columns and its default sort** (`BrowseDefaults`). A saved layout naming a column the list
  no longer has is ignored for that column.
- **Coming back to a list returns to the page and filters it was left on, focused on the
  row last opened** (`browseReturn`). Arriving fresh shows the whole list; filters and the
  page are never saved for the person.

## Excluded

- No filter on a column heading (`browse-filtering.md`).
- No column moved by the app — not on show, not on resize, not on a new release.
