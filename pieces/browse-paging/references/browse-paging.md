---
kind: behaviour
code: [packages/web/src/browse/useBrowseData.ts, packages/web/src/browse/block.ts, packages/web/src/browse/browseRows.ts, packages/web/src/browse/useBrowsePaging.ts, packages/web/src/browse/useFitPageSize.ts, packages/web/src/components/BrowsePager.tsx, packages/web/src/components/BrowseScreen.tsx, packages/ui/src/components/ui/table.tsx]
block-types: [BrowseScreen, Pager]
ui-status: approved
---

# Browse paging

A browse fills the window with rows and never scrolls: the page size is measured, and
the pager appears only when there is more than one page.

## Every list loads the same way: server blocks and a count

**Every browse reads through a `BrowseSource` and `useBrowseData`, whatever its size.**
A list never loads whole into the browser. The source is the list's server
functions:

- **rows** — a block of at most 100 rows from an offset, for the search, the filter and
  the sort (`browseRowsInput`).
- **count** — how many rows match the search and filter, read once per search and
  filter, never per page (`browseCountInput`).

The browser asks for the block a page falls in and cuts the page from it (`browseBlock`),
so a refit, a page-size change and most page changes reuse rows already in hand. Paging
and sorting keep the last page on screen while the next arrives; a new search or filter
does not.

**How the server makes a block is the server's choice.** A list over a big table pages
in SQL — `ORDER BY … OFFSET … FETCH`. A small list the server reads whole cuts its block
with `blockInMemory`. The browser cannot tell which, and the screen does not change.

The screen passes the source's rows and total to `useBrowsePaging` and renders
`<BrowsePager pager={paging.pager} />`. It computes no page counts, slices no arrays and
decides nothing about the pager. `useFitPageSize` and `BrowseFooter` are internals; no
screen uses them.

## The pager appears only when needed

`paging.pager` is null, and `BrowsePager` renders nothing, when all of these hold:

1. The page-size preference is Fit.
2. The page holds every matching row (`rows.length >= total`).
3. The rows fit with no pager on screen.

The fit measurement returns two numbers: `withoutFooter` decides whether a pager
appears; `withFooter` sizes the page once one has. A page is never sized from
`withoutFooter` — with no pager there is no size to apply. The two-row dead zone
below never governs whether the pager shows.

## Page size fits the window

- **The default is Fit**: page by exactly the rows that fit the room left for them.
  Fixed sizes of 25, 50 and 100 are offered beside it; the choice is kept in the
  browser.
- **The measured size is remembered per screen** (`<storageKey>.measured`), so a return
  visit asks for the size it settles on.
- **The computed size goes in the URL**, for the route loader.
- **Changing the page size returns to page 1.**
- **A browse's root carries `data-browse-root`** (`BrowseScreen`); the measurement reads
  the row gap and bottom padding from its computed style.
- **Rows are one height** — `TableCell` reserves `h-row`. The row height measured is the
  average of the rendered rows, measured from the first body row's top.
- **The empty state's row carries `data-browse-empty`** and is never measured.

### Measuring

- Measure the chrome above and below the rows separately, never the container whole.
- Re-fit on a `ResizeObserver` over the header region, never a dependency list.
- Read the current size through a ref; never re-measure because of a re-fit applied.
- Measure only a settled layout (`settled`, false while navigating).
- Apply a fit only once the same number reads twice, samples separated in time after
  a settle — never on consecutive animation frames.
- Apply nothing unless the confirmed fit differs from the current size by more than
  two rows.
- Until a row renders, retry the first measurement on animation frames, bounded.
- Build for the first paint; resize corrects it afterwards.

## Every block's order is total

Sort by what the user sees first, then by a unique column, so a row never moves between
blocks or appears on two pages. `blockInMemory` breaks ties by the row's key; SQL names
the key in its `ORDER BY`.

## Excluded

- No infinite scroll.
- No fixed default page size.
- No list loaded whole into the browser.
