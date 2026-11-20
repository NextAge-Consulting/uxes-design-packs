// ui-behaviour-code: loading-states.md
import { useEffect, useRef, useState } from "react"

/**
 * Anti-flash gate for a loading indicator.
 *
 * THE PROBLEM: the same control can be fast or slow depending on cache state.
 * Bind an indicator straight to `isFetching` and every cached response flashes
 * it for two frames, which reads as a glitch and measurably makes an app feel
 * slower — the exact failure the "show nothing under 1s" rule exists to prevent.
 *
 * THE GATE: don't show until `delay` has passed, and once shown hold for
 * `minVisible`. Fast responses show nothing; slow ones never blink.
 *
 * Defaults come from the loading-states guidance and are right for almost every
 * case — pass overrides only with a reason.
 *
 * ```tsx
 * const showSkeleton = useDelayedLoading(query.isFetching)
 * ```
 */
export function useDelayedLoading(
  isLoading: boolean,
  { delay = 200, minVisible = 400 }: { delay?: number; minVisible?: number } = {},
): boolean {
  const [visible, setVisible] = useState(false)
  const shownAt = useRef<number | null>(null)

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout> | undefined
    let hideTimer: ReturnType<typeof setTimeout> | undefined

    if (isLoading) {
      if (visible) return
      showTimer = setTimeout(() => {
        shownAt.current = Date.now()
        setVisible(true)
      }, delay)
    } else if (visible) {
      // Already on screen: hold it for the remainder of minVisible so a response
      // arriving just after the indicator appeared doesn't produce a blink.
      const elapsed = shownAt.current ? Date.now() - shownAt.current : minVisible
      const remaining = Math.max(0, minVisible - elapsed)
      hideTimer = setTimeout(() => {
        shownAt.current = null
        setVisible(false)
      }, remaining)
    }

    return () => {
      if (showTimer) clearTimeout(showTimer)
      if (hideTimer) clearTimeout(hideTimer)
    }
  }, [isLoading, visible, delay, minVisible])

  return visible
}
