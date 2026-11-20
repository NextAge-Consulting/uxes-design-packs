---
kind: recipe
frame: BrowseScreen
block-types: [BrowseScreen]
ui-status: approved
---

# Browse layout

A browse is a `BrowseScreen` holding, in order, a `BrowseToolbar`, any notice or panel about
the screen, the list's `ViewTabs` and `FilterChips`, a `BrowseTable`, and a `BrowsePager`.
Loading is `browse-paging.md`; filtering, chips and views are `browse-filtering.md`; the
columns are `browse-columns.md`.

## Is it a browse

Pick one:

- **A browse** — a list of first-class records, any document or master-data list.
- **A new list pattern, pending** — a list that is not a browse (the `design-system` skill,
  Step 2).

A record with more than a couple of fields opens as its own route, never as an editor
inside a browse.

## Slots

1. **Toolbar** — `BrowseToolbar`.
   - `title`: present, or left out where a card above already names the list.
   - `icon`: `useScreenIcon()`, never a picked icon (`page-heading.md`).
   - `searching`: the list's `loading`, so the spinner sits after Filters.
   - `onFilter` opens the list's `AdvancedFilter`; `filterCount` is its chips.
   - Primary slot: the create action, or nothing. Search and Filters are `outline`.
2. **Notices and panels about the whole screen** — a send in progress, a failure — above
   the views. A panel describing a finished job collapses to one line.
3. **Views and chips** — `ViewTabs` where the list has views, then `FilterChips`.
4. **Collection** — `BrowseTable`, with its columns from the list's definition.
   - A row click opens the record.
   - Row actions: `RowActions` as the last column (`table-row-actions.md`), or no actions
     column where the row offers none. A button the screen it replaces showed on the row goes
     in `RowActions`' `buttons`.
   - A row whose detail is read in place, not on a record screen, expands in the table
     with `expand` — its chevron leading the row, the detail across the table's width.
   - Heading alignment follows its data: text left; dates, days of the month and other
     numbers centred; money and quantities right, heading and value.
   - One heading per column. Columns sharing a leading word each carry the whole name —
     Last Sent, Last Opened, Last Changed.
5. **Pager** — `<BrowsePager pager={paging.pager} />`, rendered unconditionally.
