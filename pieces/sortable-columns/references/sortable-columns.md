---
kind: behaviour
code: [packages/ui/src/components/sort-head.tsx, packages/web/src/components/BrowseTable.tsx]
block-types: [BrowseScreen]
ui-status: approved
---

# Sortable columns

A browse whose order is the person's choice offers it on the column headings: `BrowseTable`
draws a `sortable` column's heading as a `SortHead`.

## When it applies

- A column is sortable when the screen's order is the person's choice — the legacy
  screen sorted by it, or no single order serves every use.
- A browse with one meaningful order (newest first, a document's own order) sorts by it
  and offers no sortable heading.

## How to build it

- Mark each sortable column `sortable`, and list it among the server functions' sortable
  ids (`browseRowsInput`); the server sorts on the column's real value.
- Keep the order in the route's search as `sort` and `desc`, and save the last order chosen
  for the person (`browse-columns.md`). With neither in the address, the list opens in the
  person's saved order, else its default.
- A click on an unsorted column sorts it ascending; a date or figure whose natural first
  view is newest or highest first is `descendingFirst`. A click on the sorted column
  reverses it.
- Changing the order drops `page`.
- Break every tie by the row's natural key, so equal values keep a stable order across
  pages.
- The server sorts every block, its order total (`browse-paging.md`).

## Excluded

- No sort control outside the heading — no "Sort by" select, no sort in the advanced
  filter.
- No multi-column sort.
