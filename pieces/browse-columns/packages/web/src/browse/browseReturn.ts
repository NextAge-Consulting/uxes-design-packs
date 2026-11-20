// ui-behaviour-code: browse-columns.md
import { useEffect } from 'react'

/**
 * Remembers where a browse was, so closing a record returns to it.
 *
 * ## Why this exists
 *
 * The whole argument for paging a browse rather than infinitely scrolling it was
 * that a user opens a record and comes BACK — and returning to the top of a
 * re-fetched list is the tax that argument refuses to pay
 * (`browse-paging.md`). Closing to a blank browse pays exactly that tax, and
 * pays it on filters and search as well as the page number.
 *
 * A browse's state IS its URL: page, size, search term and every facet are
 * search params. So "return me to where I was" is "return me to that URL", and
 * nothing more elaborate is needed.
 *
 * ## Why not the alternatives
 *
 * - **`history.back()`** — wrong for a bookmarked or deep-linked record, which
 *   has no browse behind it, and wrong again after the user has walked through
 *   several records. Non-deterministic in exactly the cases that matter.
 * - **Carrying the browse's search into the record's URL** — pollutes every
 *   record link with the state of the list it was opened from, and breaks the
 *   moment someone shares one.
 * - **`retainSearchParams`** — keeps params ON a route across navigations; it
 *   does not restore a sibling route's state. Different problem.
 *
 * ## Scope
 *
 * `sessionStorage`, so it survives a reload but not a new tab — a second tab is
 * a second train of thought and should not inherit the first one's filters.
 * Keyed by route path, so each browse remembers its own place.
 */
const KEY_PREFIX = 'app.browseReturn.'

/**
 * Call from a browse. Records its full URL on every state change — the query exactly as
 * the router wrote it, so a filter held as an object comes back as it was.
 */
export function useRememberBrowse(routePath: string, search: Record<string, unknown>) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: `search` is what changes the address; the address itself is read from the browser
  useEffect(() => {
    try {
      window.sessionStorage.setItem(KEY_PREFIX + routePath, `${routePath}${window.location.search}`)
    } catch {
      // A private-mode or quota failure costs the user their scroll position and
      // nothing else, so it must not take the screen down with it.
    }
  }, [routePath, search])
}

/**
 * Where a record's Close should go: the browse as it was last seen, or the bare
 * browse when nothing was remembered.
 *
 * Returns a plain href, so the caller navigates with it however it likes.
 */
export function browseReturnHref(routePath: string): string {
  // SSR has no `window`, and this route IS server-rendered — so without the
  // guard the reference throws on every cold load and the catch below hides it.
  // Two different situations then look identical: "there is no browser" and
  // "the browser refused storage". Only the second is an exception worth
  // catching (Safari private mode, storage disabled).
  if (typeof window === 'undefined') return routePath

  try {
    return window.sessionStorage.getItem(KEY_PREFIX + routePath) ?? routePath
  } catch {
    return routePath
  }
}

/**
 * Forgets every remembered browse. Called on sign-out: a remembered place — a search,
 * the filters — belongs to the sign-in that left it.
 */
export function forgetBrowseReturns(): void {
  if (typeof window === 'undefined') return
  try {
    const keys = Array.from({ length: window.sessionStorage.length }, (_, i) => window.sessionStorage.key(i))
    for (const key of keys) if (key?.startsWith(KEY_PREFIX)) window.sessionStorage.removeItem(key)
  } catch {
    // Storage the browser refuses was never written to, so there is nothing to forget.
  }
}

const ROW_PREFIX = `${KEY_PREFIX}row.`

/** Called as a list opens one of its rows, so focus can come back to that row on return. */
export function rememberOpenedRow(routePath: string, rowId: string): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(ROW_PREFIX + routePath, rowId)
  } catch {
    // Storage the browser refuses: the list opens with no row focused, as on a first visit.
  }
}

/** The row last opened from this list, once — reading it forgets it. */
export function takeOpenedRow(routePath: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const id = window.sessionStorage.getItem(ROW_PREFIX + routePath)
    window.sessionStorage.removeItem(ROW_PREFIX + routePath)
    return id
  } catch {
    return null
  }
}
