// ui-behaviour-code: browse-filtering.md
import { useState } from "react"

/**
 * What a filter control shows: the person's choice the moment they make it, then the
 * applied value once the list has loaded it. `key` says when the applied value changed,
 * so a value rebuilt on every render (a new Set) does not undo the choice.
 */
export function useChosen<V>(applied: V, key: string): [V, (next: V) => void] {
  const [chosen, setChosen] = useState(applied)
  const [seen, setSeen] = useState(key)
  // Adjusting state while rendering, when the applied value changes — React's own
  // pattern for state that follows a prop, with no effect and no extra paint.
  if (key !== seen) {
    setSeen(key)
    setChosen(applied)
  }
  return [chosen, setChosen]
}
