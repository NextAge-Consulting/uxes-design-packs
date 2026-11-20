// ui-behaviour-code: saving.md
import { useEffect } from 'react'

/**
 * Ctrl/Cmd+S saves the form.
 *
 * Distance to the save button stops mattering once this exists, which is half of
 * why the form rules can refuse a fixed action bar
 * (`ui-patterns/references/saving.md`). It is also an accessibility gain
 * rather than a cost: a keyboard user reaches the save without tabbing the whole
 * form.
 *
 * @param onSave  Called when the shortcut fires. Not called while `enabled` is
 *                false, so a clean or busy form silently ignores the key rather
 *                than firing a redundant write.
 */
export function useSaveShortcut(onSave: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const handler = (event: KeyboardEvent) => {
      if (event.key !== 's' && event.key !== 'S') return
      // `metaKey` on macOS, `ctrlKey` elsewhere. Accepting either would make
      // Ctrl+S on a Mac — which is not a browser save — do something the user
      // did not ask for.
      // `navigator.platform` is deprecated; the user-agent string is the
      // supported way to tell an Apple keyboard from the rest.
      const apple = /mac|iphone|ipad|ipod/i.test(navigator.userAgent)
      const chord = apple
        ? event.metaKey && !event.ctrlKey
        : event.ctrlKey && !event.metaKey
      if (!chord || event.altKey) return

      // Only once the chord is confirmed, so a plain "s" typed into a field is
      // never swallowed.
      event.preventDefault()
      onSave()
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onSave, enabled])
}
