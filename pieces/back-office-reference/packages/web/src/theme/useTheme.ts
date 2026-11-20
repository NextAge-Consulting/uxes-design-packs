import { useCallback, useEffect, useState } from "react"

type Theme = "light" | "dark"
const KEY = "theme"
const OS_DARK = "(prefers-color-scheme: dark)"

/**
 * Dark mode follows the OS in CSS (`@custom-variant dark` in the design
 * system's styles.css), so a page is right before any script runs. This hook
 * only records an explicit choice: a `dark` or `light` class on <html>, saved
 * under KEY. Toggling back to what the OS shows clears the choice, and the page
 * follows the OS again.
 *
 * Storage is wrapped in try/catch because a private window or blocked site data
 * makes it THROW on access, not merely return null; the toggle then still works
 * for the session, and the page still follows the OS.
 */
export function useTheme() {
  const [choice, setChoice] = useState<Theme | null>(null)
  const [osDark, setOsDark] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY)
      if (stored === "light" || stored === "dark") setChoice(stored)
    } catch {
      // storage unavailable — no saved choice, the OS decides
    }
    const query = window.matchMedia(OS_DARK)
    setOsDark(query.matches)
    const follow = (e: MediaQueryListEvent) => setOsDark(e.matches)
    query.addEventListener("change", follow)
    return () => query.removeEventListener("change", follow)
  }, [])

  const theme: Theme = choice ?? (osDark ? "dark" : "light")

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark"
    const saved = next === (osDark ? "dark" : "light") ? null : next
    const root = document.documentElement.classList
    root.toggle("dark", saved === "dark")
    root.toggle("light", saved === "light")
    try {
      if (saved) localStorage.setItem(KEY, saved)
      else localStorage.removeItem(KEY)
    } catch {
      // storage unavailable — the choice holds for this session only
    }
    setChoice(saved)
  }, [theme, osDark])

  return { theme, toggle }
}

/** Runs in <head> before first paint, so a saved choice never flashes the
 *  OS theme first. */
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.classList.add(t)}catch(e){}`
