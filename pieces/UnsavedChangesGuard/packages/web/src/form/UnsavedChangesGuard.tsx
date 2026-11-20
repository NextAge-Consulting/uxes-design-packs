// ui-content
// ui-behaviour-code: inline-form.md, saving.md
import { useBlocker } from '@tanstack/react-router'
import { ConfirmDialog } from '@design-pack/ui/components/confirm-dialog'
import { useEffect } from 'react'
import { holdUnsavedWork } from './unsavedWork'
/**
 * Stops a navigation away from a form with unsaved changes, and asks.
 *
 * **This is what protects unsaved work — not where the Save button sits.**
 * Placement was only ever standing in for "do not let me lose this", and
 * treating it with geometry is what leads to fixed action bars, which are a
 * documented accessibility failure (`saving.md`). Guard the navigation and
 * the button is free to sit where it belongs: at the end of the region it saves.
 *
 * `enableBeforeUnload` is left at its default, so closing the tab or hitting
 * reload gets the browser's own prompt as well. That one cannot be styled and
 * should not be — a native prompt is the only thing that survives the page
 * going away.
 *
 * While the form is dirty it also holds `unsavedWork`, so nothing reloads the page on
 * its own under the person's changes.
 *
 * The question is a `ConfirmDialog`: the safe answer first and focused, the
 * discard destructive.
 */
export function UnsavedChangesGuard({ when }: { when: boolean }) {
  useEffect(() => (when ? holdUnsavedWork() : undefined), [when])

  const { status, proceed, reset } = useBlocker({
    shouldBlockFn: () => when,
    withResolver: true,
  })

  // `proceed` and `reset` exist only while blocked, which is exactly when the
  // dialog is open — so they are called through optional chaining rather than
  // asserted, and a stray call while idle is a no-op instead of a crash.
  if (status !== 'blocked') return null
  return (
    <ConfirmDialog
      title="Leave without saving?"
      description="This form has changes that have not been saved. Leaving now discards them."
      confirmLabel="Discard Changes"
      cancelLabel="Stay on This Page"
      busyLabel="Leaving the page"
      destructive
      onConfirm={() => proceed?.()}
      onCancel={() => reset?.()}
    />
  )
}
