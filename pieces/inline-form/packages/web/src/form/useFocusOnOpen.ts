// ui-behaviour-code: inline-form.md
import { useEffect, useRef } from 'react'

/**
 * Opening a form is the person's intent, so its first field takes focus — once, as it
 * opens (`a11y-baseline.md`, "Never `autoFocus`"). Never an inline callback ref
 * (`ref={(el) => el?.focus()}`): that is a new function on every render, which React
 * calls again each time, pulling focus back to this field while someone types in
 * another.
 */
export function useFocusOnOpen<T extends HTMLElement = HTMLInputElement>() {
  const ref = useRef<T>(null)
  useEffect(() => ref.current?.focus(), [])
  return ref
}
