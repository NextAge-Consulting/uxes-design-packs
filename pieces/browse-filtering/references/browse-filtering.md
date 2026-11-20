---
kind: behaviour
code: [packages/ui/src/components/browse-toolbar.tsx, packages/ui/src/components/filter-chips.tsx, packages/ui/src/components/view-tabs.tsx, packages/web/src/browse/advancedFilter.ts, packages/web/src/components/AdvancedFilter.tsx, packages/ui/src/hooks/use-chosen.ts]
block-types: [BrowseToolbar, FilterDialog, FilterChips, SavedViews]
ui-status: approved
---

# Browse filtering

The search box is the list's primary search; Filters opens the list's advanced filter,
a form of every other way to narrow it. Every filter that narrows the list shows as a chip.

## Search

- **The toolbar holds one row**: title · search · Search · Filters · status.
- **The search box covers what people look a record up by most** — for a person: name,
  address, email, phone. Name its fields in the placeholder.
- **A search runs on Search, Enter or leaving the box**, once per changed term. The box's ×
  clears it at once.

## The advanced filter

- **Filters opens `AdvancedFilter`**, with the list's fields from `advancedFilter.ts`:
  the columns worth narrowing by, plus any field or range the list needs.
- **Propose a list's fields to the developer before building them**, drawn from its
  columns' data types and the filter of the screen it replaces.
- **Each field type has one fixed match**, and the fields combine with AND:
  - text contains;
  - a pick-list equals;
  - a multi-pick matches any chosen value, and stores what is chosen;
  - a date or number range takes From and To, both inclusive, either optional;
  - a switch narrows when on.
- **A pick-list too long to read is searchable** — type to find.
- **Search applies the form; Clear empties it.** Changing a filter drops `page`.

### Its layout follows the form rules

- **Fields that belong together sit side by side, two to a row, under a headed group**:
  Name, Address, Account, Dates.
- **Pair fields so the rows balance** — Status | Type, Owner | Category.
- **A name takes its whole row; City, State and Zip always stay together.**
- **Switches stack together in the second column.**
- **A range is one row labelled `<Label> From | To`**, with no heading above it; the group
  is named for screen readers only.
- **A switch has no caption above it**: its one label sits beside it and names what the
  list is narrowed to while it is on (`boolean-fields.md`). Its chip is that label alone.

## Chips

- **Every filter narrowing the list shows a chip under the toolbar, `Label: value`**, after
  "Active filters:"; its × removes that filter. `filterChips()` builds them.
- **A filter that narrows by default shows its chip from the start**, and its × widens the
  list. A choice that narrows nothing — All — has none.
- **The Filters button's badge counts the chips.**
- **A list empty under only its default chips says what the default shows** — "No
  open items."

## Views

- **A list with separate views — Active and Archived, one source's log or another's —
  switches them with `ViewTabs`, not a filter field.** The tabs sit directly above the
  table with the chips, below any notice or panel about the screen, each with its count
  where it has one.

## Excluded

- No filters on the column headings.
- No saved filters.
- No export.
- No filter reachable only by URL.
