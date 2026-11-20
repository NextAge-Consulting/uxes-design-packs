// ui-behaviour-code: browse-paging.md
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Page size for a browse: measure the space actually left for rows and page by
 * exactly that, so a page never hides rows and never needs scrolling.
 *
 * Pattern, rationale and rejected alternatives:
 * `.claude/skills/ui-patterns/references/browse-paging.md`.
 *
 * The screen supplies the current size from its URL and applies whatever this
 * returns — the hook owns measurement and the stored preference, the route owns
 * navigation, because only the route knows its own search-param shape.
 *
 * Screens do not use this directly. `useBrowsePaging` composes it with the
 * paging arithmetic and the show/hide decision for the pager; going straight to
 * this hook means hand-rolling both.
 */

/** Fixed sizes offered alongside FIT. */
export const PAGE_SIZES = [25, 50, 100] as const
export const FIT = 'fit'
export type PageSizePreference = typeof FIT | number

/** Used only until the first measurement lands. */
export const FALLBACK_PAGE_SIZE = 15
/** Never page by fewer than this, however short the window. */
const MIN_PAGE_SIZE = 5

/**
 * Where the last measured fit is remembered, per screen.
 *
 * The preference (`fit` vs a fixed number) and the measured NUMBER are two
 * different facts and both are worth keeping. Storing only the preference means
 * a return visit renders at the fallback and then visibly reflows to the fitted
 * size, every time, having already known the answer.
 *
 * This is a comfort, not a correctness lever: the block fetch (`browse/block`)
 * is what makes the refit free. Remembering the number just stops it being seen.
 */
function measuredKey(storageKey: string): string {
  return `${storageKey}.measured`
}

function isFixedPageSize(value: unknown): value is (typeof PAGE_SIZES)[number] {
  return PAGE_SIZES.includes(value as (typeof PAGE_SIZES)[number])
}

/** The last fit measured on this screen, if one was ever measured. Read after
 *  mount only — localStorage does not exist during SSR. */
function readMeasuredPageSize(storageKey: string): number | null {
  const stored = Number(window.localStorage.getItem(measuredKey(storageKey)))
  return Number.isFinite(stored) && stored >= MIN_PAGE_SIZE ? stored : null
}

/**
 * One measurement of the window, expressed both ways.
 *
 * Both numbers matter because the pager occupies space it is only entitled to
 * once it exists. A list of 19 rows in a window that fits 20 unpaged needs no
 * pager at all — measuring only `withFooter` would read 18, page it, and produce
 * a `1 / 2` pager with three rows stranded on page two. That is the dead control
 * the whole thing exists to avoid, arriving two rows early.
 */
interface FitMeasurement {
  /** Rows that fit when the pager IS on screen. Null while it is not — its
   *  height is only knowable from the DOM, and guessing it is what a constant
   *  would be. */
  withFooter: number | null
  /** Rows that fit when the pager is NOT on screen. Always knowable: when the
   *  pager is absent it is simply the room, and when it is present its measured
   *  height and gap are added back. */
  withoutFooter: number
}

/**
 * How many rows fit above the pager, and how many fit if there is no pager.
 * Null when the table is not on screen yet.
 *
 * Measures the chrome ABOVE and BELOW the rows separately, never the container
 * as a whole. Two traps that avoids:
 *   · `scrollHeight` clamps to `clientHeight` when nothing overflows, so a
 *     whole-container measurement makes any window look full and fit never
 *     grows back when the window is enlarged.
 *   · The root fills the scroller (`min-h-full`) so the pager can centre in the
 *     leftover — its height is therefore always the viewport height and carries
 *     no information at all.
 * Gap and padding come from computed style rather than constants, so the
 * measurement self-corrects when the layout's spacing changes.
 */
function measureFit(): FitMeasurement | null {
  const scroller = document.querySelector('main')
  const root = document.querySelector<HTMLElement>('[data-browse-root]')
  const row = document.querySelector('tbody tr')
  if (!scroller || !root || !row) return null

  // The empty state is a single tall cell, not a row — measuring it reports a
  // row height several times the real one and fits almost nothing. There is
  // nothing to page anyway, so decline to measure rather than measure wrongly.
  if (row.hasAttribute('data-browse-empty')) return null

  // The AVERAGE rendered row, not the first one.
  //
  // `TableCell` reserves `h-9`, so ordinary rows are all the same height and
  // the average equals any single row — this is not compensating for jitter,
  // which is fixed at the source. It is here for the one case where rows
  // legitimately differ: a column of wrapping text, where a two-line row is
  // real content rather than a styling accident. Sampling the first row there
  // would size the page from whichever row happened to be on top.
  const rows = document.querySelectorAll('tbody tr')
  const last = rows[rows.length - 1]
  const rowHeight =
    rows.length > 1 && last
      ? (last.getBoundingClientRect().bottom - row.getBoundingClientRect().top) / rows.length
      : row.getBoundingClientRect().height
  if (rowHeight < 1) return null

  const style = getComputedStyle(root)
  const gap = parseFloat(style.rowGap || '0')
  const above = row.getBoundingClientRect().top - scroller.getBoundingClientRect().top

  // Everything from the first row's top to the bottom of the scroller, less the
  // root's own bottom padding. This is the space the rows AND the pager share,
  // which is why it is the same number in both states — the pager's height is
  // taken out of it rather than added to it.
  const room = scroller.clientHeight - above - parseFloat(style.paddingBottom || '0')
  const fit = (px: number) => Math.max(MIN_PAGE_SIZE, Math.floor(px / rowHeight))

  // The pager costs its own height plus the gap above it. Absent, it costs
  // nothing — there is no trailing gap when the table is the last child.
  const footer = document.querySelector('[data-browse-footer]')
  const footerRoom = footer ? footer.getBoundingClientRect().height + gap : null

  return {
    withoutFooter: fit(room),
    withFooter: footerRoom === null ? null : fit(room - footerRoom),
  }
}

interface FitPageSize {
  /** The user's choice — `'fit'` or a fixed number. Null until read from storage. */
  preference: PageSizePreference | null
  /** The last confirmed measurement, or null before one lands. Reported without
   *  the dead zone below, which governs only whether a new size is worth a
   *  navigation — never whether the pager belongs on screen. */
  fit: FitMeasurement | null
  /** Call from the rows selector. Persists, then reports the size to apply
   *  (null in fit mode — the measurement supplies it). */
  choose: (choice: string) => number | null
}

/**
 * @param storageKey  Per-screen, so a dense browse and a sparse one can differ.
 * @param currentSize The size the URL currently carries.
 * @param applySize   Navigate to this size. MUST use `replace` — refitting
 *                    should never litter the back button.
 * @param settled     False while the router is navigating. Measuring mid-flight
 *                    reads a layout that is not the final one — the pager has
 *                    not taken its place yet, so the rows look like they have
 *                    more room than they do and the fit comes out too large.
 */
export function useFitPageSize(
  storageKey: string,
  currentSize: number | undefined,
  applySize: (size: number) => void,
  settled: boolean,
): FitPageSize {
  // `null` means "not read yet". Fitting must not start before the stored
  // choice lands, or a saved fixed size loses a race with the first measurement
  // and is silently replaced by a fitted one.
  const [preference, setPreference] = useState<PageSizePreference | null>(null)
  const [fit, setFit] = useState<FitMeasurement | null>(null)

  // Read through a ref, never a dependency — see the note on the measuring
  // effect below, where this is load-bearing.
  const currentSizeRef = useRef(currentSize)
  currentSizeRef.current = currentSize

  // `applySize` goes through a ref for the SAME reason, and it is just as
  // load-bearing. A screen naturally writes its callbacks inline —
  // `onRefit: (size) => navigate(...)` — which is a new function identity on
  // every render. In a dependency list that tears the measuring effect down and
  // restarts it on every render, so the settle and confirm timers below never
  // elapse and the refit NEVER APPLIES.
  //
  // The failure is silent and looks like a layout bug: the browse renders at
  // whatever size it first had and leaves the rest of the window empty, with no
  // error and nothing in the console. Measured at 1440x1300 it was nine rows
  // short — 325px of dead space under the table.
  //
  // Requiring every caller to wrap three callbacks in `useCallback` would be a
  // contract nobody can see they have broken, so the hook holds them still
  // instead.
  const applyRef = useRef(applySize)
  applyRef.current = applySize
  const apply = useCallback((size: number) => applyRef.current(size), [])

  // Read after mount, never during render — localStorage does not exist during
  // SSR and reading it inline breaks hydration (same approach as useTheme).
  //
  // A remembered fit is applied straight away, before anything is measured, so
  // a return visit renders at the size it will settle on instead of rendering
  // at the fallback and reflowing once the measurement confirms what we already
  // knew. It costs no fetch: the block is the same either way.
  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey)
    const choice = isFixedPageSize(Number(stored)) ? Number(stored) : FIT
    setPreference(choice)
    if (choice === FIT && currentSizeRef.current === undefined) {
      const remembered = readMeasuredPageSize(storageKey)
      if (remembered !== null) apply(remembered)
    }
  }, [storageKey, apply])

  // Read through a ref, never a dependency.
  //
  // THIS IS THE WHOLE FIX for the oscillation. `currentSize` used to be in the
  // dependency list, so every navigation this effect CAUSED re-ran it and
  // re-measured — and a measurement taken while the next page is still
  // rendering disagrees with the settled one by a row or two. Fit at 15 rows,
  // navigate to 18, re-measure mid-render, get 22, navigate again… Each hop is
  // a real navigation showing a skeleton, which is what the user sees as the
  // screen flapping before it settles.
  //
  // Measuring is now driven ONLY by things that genuinely change the space
  // available: the first paint with rows in it, and a later resize. The size we
  // ourselves applied is not one of them.
  useEffect(() => {
    if (preference === null) return
    // Measure only a settled layout. This is the other half of the fix: without
    // it the first measurement lands during the skeleton phase and reads room
    // that the pager is about to occupy, fitting more rows than actually fit.
    if (!settled) return

    if (preference !== FIT) {
      if (currentSizeRef.current !== preference) apply(preference)
      return
    }

    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    /**
     * Apply a fit only once the same number has been measured TWICE, separated
     * in time.
     *
     * The measurement is bistable: with 18 rows on screen the formula says 22
     * fit, and with 22 it says 18. The two states each measure consistently, so
     * sampling twice on consecutive frames confirms a reading that is about to
     * be contradicted — which is how the pager ends up flipping 18 → 22 → 18
     * → 22, each hop a navigation the user watches.
     *
     * Separating the samples by a beat means the second one is taken after the
     * layout has finished reflowing, so a value that is going to flip has
     * already flipped and is not applied. Combined with the dead zone, the
     * screen fits once and stops.
     */
    const SETTLE_MS = 250
    const CONFIRM_MS = 120

    const applyIfWorthIt = (measured: FitMeasurement) => {
      // Report first, and unconditionally — the pager's presence is decided
      // from this, and suppressing it here would leave a browse that grew past
      // one screen with no pager until something else forced a re-measure.
      setFit((prev) =>
        prev !== null &&
        prev.withFooter === measured.withFooter &&
        prev.withoutFooter === measured.withoutFooter
          ? prev
          : measured,
      )

      // A size can only be applied from a measurement that had the pager on
      // screen. Sizing from `withoutFooter` while the pager is about to appear
      // overstates the room by exactly the pager, and the dead zone below is
      // wide enough to then swallow the correction — leaving a page that
      // overflows. `useBrowsePaging` renders every row while the pager is
      // hidden, so there is nothing to size in that state anyway.
      if (measured.withFooter === null) return

      // Remember what this window fits, so the next visit renders at that size
      // instead of rendering at the fallback and reflowing to the same answer.
      // Written on every confirmed measurement, including one inside the dead
      // zone below — the dead zone governs whether a NAVIGATION is worth it, and
      // the stored number should still be the truest one we have.
      window.localStorage.setItem(measuredKey(storageKey), String(measured.withFooter))

      // A two-row dead zone. One row is within the noise of two settled
      // layouts, and the second row is not worth a navigation either — the
      // pager showing one fewer row costs the user nothing, and re-fitting
      // costs them a visible reload.
      if (Math.abs(measured.withFooter - (currentSizeRef.current ?? 0)) <= 2) return
      apply(measured.withFooter)
    }

    const refit = () => {
      if (cancelled) return
      const first = measureFit()
      if (first === null) return
      timer = setTimeout(() => {
        if (cancelled) return
        const second = measureFit()
        if (second === null) return
        if (
          second.withFooter !== first.withFooter ||
          second.withoutFooter !== first.withoutFooter
        ) {
          return
        }
        applyIfWorthIt(second)
      }, CONFIRM_MS)
    }

    let frames = 0
    let raf = 0
    const attempt = () => {
      if (cancelled) return
      if (measureFit() !== null || frames > 60) {
        timer = setTimeout(refit, SETTLE_MS)
        return
      }
      frames += 1
      raf = requestAnimationFrame(attempt)
    }
    attempt()

    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(refit, SETTLE_MS)
    }

    // Resize is EXCEPTION HANDLING, not the main path — it fires when someone
    // drags the window, which is rare. Watching the header region as well as
    // the window catches the toolbar wrapping at a narrow width, which steals
    // room from the rows without the window changing size at all.
    const head = document.querySelector('[data-browse-head]')
    const observer = head ? new ResizeObserver(schedule) : null
    observer?.observe(head as Element)
    window.addEventListener('resize', schedule)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      observer?.disconnect()
      window.removeEventListener('resize', schedule)
    }
  }, [preference, apply, settled, storageKey])

  return {
    preference,
    fit,
    choose: (choice: string) => {
      window.localStorage.setItem(storageKey, choice)
      if (choice === FIT) {
        setPreference(FIT)
        return null
      }
      setPreference(Number(choice))
      return Number(choice)
    },
  }
}
