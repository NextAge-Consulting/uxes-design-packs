// ui-status: approved
// ui-block: EntityModal
// ui-behaviour: loading-states.md, saving.md
import type * as React from "react"
import { useState } from "react"

import { BusySlot, BusyStatus } from "@design-pack/ui/components/busy-status"
import { ConfirmDialog } from "@design-pack/ui/components/confirm-dialog"
import { ModalBody, ModalFooter, ModalHeader } from "@design-pack/ui/components/modal-shell"
import { Button } from "@design-pack/ui/components/ui/button"
import { Dialog, DialogContent } from "@design-pack/ui/components/ui/dialog"

/**
 * What a request to close an edit dialog does: close it, or ask first.
 *
 * Every way out — the ✕, Escape, a click outside, the Close button — asks this
 * one question, so no path discards unsaved changes without a word.
 */
export function closeStep(isDirty: boolean): "close" | "confirm-discard" {
  return isDirty ? "confirm-discard" : "close"
}

/**
 * Edit one record in a dialog, ending with Save — for a record that only makes
 * sense beside the list it was opened from.
 *
 * Its title is the record's identity heading, so it carries the record's mark
 * the way a record page does. `icon` is the opening screen's own icon, resolved
 * by the app from its screen registry — never chosen per dialog.
 *
 * The content is the form's fields in `ModalSection`s; the dialog body IS the
 * `<form>`, so Enter submits. The footer follows the dialog convention:
 * right-aligned, Close then Save, with the form's state in words beside them — a
 * failed save included, which takes the unsaved-changes line's place.
 *
 * - **Save is gated on `canSave`** — changed and valid. Disabled means nothing
 *   to save; while saving it goes busy, never disabled, and a second submit is
 *   refused here.
 * - **Close never discards silently.** With unsaved changes, every way out asks
 *   "Discard your changes?" first (`closeStep`). This guards closing the
 *   dialog; leaving the page is the app's navigation guard's job.
 * - **`remove` adds the record's delete** to the footer group, ahead of Close, in
 *   the destructive colour, and asks before it runs. A failure comes back through
 *   `failure`, like a failed save.
 */
export function EntityModal({
  title,
  icon,
  description,
  banner,
  failure,
  width = "default",
  saveLabel = "Save",
  busyLabel,
  isDirty,
  canSave,
  saving,
  saved,
  onSubmit,
  onClose,
  remove,
  children,
}: {
  title: React.ReactNode
  /** The opening screen's icon, from the app's screen registry. */
  icon?: React.ComponentProps<typeof ModalHeader>["icon"]
  description?: React.ReactNode
  /** A notice about this record, above the fields — a setup hint. Never a failure. */
  banner?: React.ReactNode
  /** Why the last save failed, in words for the person — a box directly above Close and
   *  Save. */
  failure?: string | null
  width?: "default" | "wide"
  saveLabel?: string
  /** Announced to screen readers while saving. */
  busyLabel: string
  /** The values differ from what is saved. */
  isDirty: boolean
  /** Changed and valid — there is something to save. */
  canSave: boolean
  saving: boolean
  /** The last save succeeded and nothing has changed since. */
  saved: boolean
  onSubmit: () => void
  /** Closes the dialog. Called only once any unsaved changes are dealt with. */
  onClose: () => void
  /** Deleting the record from here, for a record being changed rather than added. */
  remove?: {
    /** The button: "Delete Address". */
    label: string
    /** The question: "Delete this address?". */
    question: string
    /** What deleting does, in the person's words. */
    consequence: string
    /** Announced to screen readers while it runs. */
    busyLabel: string
    /** Runs once confirmed. The caller words a failure through `failure` and logs
     *  its detail — a server function's is already logged on the server. A rejection
     *  still reaches the person, as a general line. */
    onConfirm: () => Promise<void>
  }
  children: React.ReactNode
}) {
  const [askingToDiscard, setAskingToDiscard] = useState(false)
  const [askingToRemove, setAskingToRemove] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeFailed, setRemoveFailed] = useState(false)
  const shownFailure = failure ?? (removeFailed ? "That couldn't be deleted just now. Please try again." : null)

  const requestClose = () => {
    if (closeStep(isDirty) === "close") onClose()
    else setAskingToDiscard(true)
  }

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && requestClose()}>
        <DialogContent size={width === "wide" ? "report" : "default"}>
          <ModalHeader title={title} description={description} icon={icon} />
          <form
            className="contents"
            onSubmit={(event) => {
              event.preventDefault()
              if (saving) return
              setRemoveFailed(false)
              onSubmit()
            }}
          >
            {width === "wide" ? (
              <ModalBody>
                {banner}
                {children}
              </ModalBody>
            ) : (
              <>
                {banner}
                {children}
              </>
            )}
            <ModalFooter failure={shownFailure && !saving ? shownFailure : null}>
              <p className="type-body text-muted-foreground sm:mr-auto" aria-live="polite">
                {saving ? null : isDirty ? "You have unsaved changes." : saved ? "Saved." : null}
              </p>
              {remove ? (
                <Button type="button" variant="ghost-destructive" disabled={saving} onClick={() => setAskingToRemove(true)}>
                  {remove.label}
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={requestClose}>
                Close
              </Button>
              <Button type="submit" disabled={!canSave}>
                {/* A reserved slot, so the spinner does not move the label. */}
                <BusySlot busy={saving} />
                {saveLabel}
                <BusyStatus busy={saving}>{busyLabel}</BusyStatus>
              </Button>
            </ModalFooter>
          </form>
        </DialogContent>
      </Dialog>

      {askingToDiscard ? (
        <ConfirmDialog
          title="Discard your changes?"
          description="They haven't been saved. Closing now discards them."
          confirmLabel="Discard Changes"
          cancelLabel="Keep Editing"
          busyLabel="Discarding the changes"
          destructive
          onConfirm={() => {
            setAskingToDiscard(false)
            onClose()
          }}
          onCancel={() => setAskingToDiscard(false)}
        />
      ) : null}

      {remove && askingToRemove ? (
        <ConfirmDialog
          title={remove.question}
          description={remove.consequence}
          confirmLabel={remove.label}
          cancelLabel="Keep It"
          busyLabel={remove.busyLabel}
          destructive
          confirming={removing}
          onConfirm={() => {
            setRemoving(true)
            setRemoveFailed(false)
            remove
              .onConfirm()
              .catch(() => setRemoveFailed(true))
              .finally(() => {
                setRemoving(false)
                setAskingToRemove(false)
              })
          }}
          onCancel={() => setAskingToRemove(false)}
        />
      ) : null}
    </>
  )
}
