/**
 * Whether a form on this page holds changes that have not been saved.
 *
 * `UnsavedChangesGuard` holds it while its form is dirty; anything about to replace
 * the page on its own — a reload after a release (`serverFn/outdatedPage.ts`) — asks
 * first. Browser-only state: nothing on the server holds or reads it.
 */
let held = 0

/** Marks unsaved work on the page until the returned function is called. */
export function holdUnsavedWork(): () => void {
  held += 1
  let released = false
  return () => {
    if (released) return
    released = true
    held -= 1
  }
}

export function hasUnsavedWork(): boolean {
  return held > 0
}
