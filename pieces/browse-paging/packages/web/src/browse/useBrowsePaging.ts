// ui-behaviour-code: browse-paging.md

import {
  FALLBACK_PAGE_SIZE,
  FIT,
  useFitPageSize,
  type PageSizePreference,
} from './useFitPageSize'

/**
 * Paging for a browse — the arithmetic, the fit, and whether the pager belongs on
 * screen at all (`browse-paging.md`). Every list passes the page its rows came back as,
 * from `useBrowseData`, with the total and the size it was read by; whether a pager
 * shows is asked here, continuously, against the real window, never by a screen.
 */

/** What the pager needs. Null when the list fits and there is nothing to page. */
export interface BrowsePagerProps {
  page: number
  pageCount: number | null
  pageSize: number
  rowsOnPage: number
  total: number | null
  noun: string
  preference: PageSizePreference | null
  /** A child list's fixed sizes, offered with no Fit (`child-list.md`); absent on a browse. */
  sizes?: readonly number[]
  onPageSizeChange: (choice: string) => void
  onGoToPage: (page: number) => void
}

interface BrowsePagingCommon {
  /** Per-screen, so a dense browse and a sparse one can differ. */
  storageKey: string
  /** Singular; the pager pluralises it for the empty state. */
  noun: string
  /** The page the URL carries. */
  page: number | undefined
  /** The size the URL carries. */
  size: number | undefined
  /**
   * Apply a measured fit. MUST navigate with `replace` — refitting is not a
   * place the back button should return to.
   */
  onRefit: (size: number) => void
  /**
   * The user picked from the rows selector. Null means Fit, where the
   * measurement supplies the size instead. Returns to page 1 either way — page
   * 7 of 25-row pages is not page 7 of 100-row pages.
   */
  onChooseSize: (size: number | null) => void
  onGoToPage: (page: number) => void
  /**
   * False while the router is navigating. Screens with no loading phase of
   * their own pass nothing.
   */
  settled?: boolean
}

type BrowsePagingInput<T> = BrowsePagingCommon & {
  /** The page the server returned, rendered as-is. */
  rows: T[]
  /** Null until the count arrives. */
  total: number | null
  /** The size the server actually paged by, which may lag the URL. */
  pageSize: number
}

interface BrowsePaging<T> {
  /** The rows to render: what was passed. Screens render this and never slice. */
  rows: T[]
  /** Props for `BrowsePager`, or null when the list fits unpaged. */
  pager: BrowsePagerProps | null
}

/**
 * Whether the list fits with no pager on screen — the one decision this whole
 * hook exists to make, kept pure so it can be reasoned about (and tested)
 * without a DOM.
 *
 * It is evaluated identically whichever state the pager is currently in, which is
 * what keeps it from flapping: both states
 * measure the same `withoutFooter`, so a list that hides the pager re-measures
 * and agrees, and one that shows it re-measures and agrees.
 *
 * Three conditions, each load-bearing:
 *
 * - **Fit is the preference.** Someone who picked a fixed size opted into
 *   paging, and the rows selector lives inside the pager — hiding it would
 *   strand them at 25 rows with no way back to Fit.
 * - **The page holds every row.** A page of 15 out of 19 fits the window but is
 *   not the list, and hiding the pager there would silently drop four rows.
 * - **They fit with the pager absent** — `withoutFooter`, never `withFooter`.
 *   Nineteen rows in a window that fits twenty unpaged need no pager; judging
 *   them against `withFooter` would page them at eighteen and produce a `1 / 2`
 *   pager with three rows stranded on page two. See `FitMeasurement`.
 *
 * Before the first measurement lands, `FALLBACK_PAGE_SIZE` stands in. It only
 * has to be right for lists far shorter than a window — which is exactly the
 * case that would otherwise flash a pager on every load of a short browse.
 */
function fitsWithoutPager({
  preference,
  total,
  rowsOnClient,
  withoutFooter,
}: {
  preference: PageSizePreference | null
  total: number | null
  rowsOnClient: number
  withoutFooter: number | null
}): boolean {
  // Null is "not read from storage yet", which is every first paint including
  // SSR — so it must not be treated as "not Fit". Deciding from the row count
  // alone is right for the overwhelmingly common case (a short list under Fit)
  // and keeps a short browse from flashing a pager it is about to hide.
  if (preference !== null && preference !== FIT) return false
  if (total === null) return false
  if (rowsOnClient < total) return false
  return total <= (withoutFooter ?? FALLBACK_PAGE_SIZE)
}

export function useBrowsePaging<T>(input: BrowsePagingInput<T>): BrowsePaging<T> {
  const { storageKey, noun, page, size, onRefit, onChooseSize, onGoToPage } = input
  const settled = input.settled ?? true

  const { preference, fit, choose } = useFitPageSize(storageKey, size, onRefit, settled)

  const pageSize = input.pageSize
  const currentPage = Math.max(1, page ?? 1)
  const total = input.total

  const unpaged = fitsWithoutPager({
    preference,
    total,
    rowsOnClient: input.rows.length,
    withoutFooter: fit?.withoutFooter ?? null,
  })

  const pageCount = total === null ? null : Math.max(1, Math.ceil(total / pageSize))
  const rows = input.rows

  return {
    rows,
    pager: unpaged
      ? null
      : {
          page: currentPage,
          pageCount,
          pageSize,
          rowsOnPage: rows.length,
          total,
          noun,
          preference,
          onPageSizeChange: (choice) => onChooseSize(choose(choice)),
          onGoToPage,
        },
  }
}
