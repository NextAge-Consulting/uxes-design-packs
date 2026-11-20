// ui-status: approved
// ui-block: ReviewDialog
// ui-behaviour: confirm-before-write.md, loading-states.md
// Guarantee: an ordinary dialog labelled by its title, never role="alertdialog" — the
// person asked for it, and its content is a report.
import type * as React from "react"
import { useRef } from "react"

import { BusySlot, BusyStatus } from "@design-pack/ui/components/busy-status"
import { ModalBody, ModalFooter, ModalHeader } from "@design-pack/ui/components/modal-shell"
import { Badge } from "@design-pack/ui/components/ui/badge"
import { Button } from "@design-pack/ui/components/ui/button"
import { Dialog, DialogContent } from "@design-pack/ui/components/ui/dialog"

/**
 * The screen half of `confirm-before-write`: a detailed preview of a write —
 * counts, tables, problems found — ending Continue or Cancel, then the same
 * report of what was done, ending Close.
 *
 * Wide and scrolling, unlike `ConfirmDialog`'s one question. The content goes in
 * `ModalSection`s.
 *
 * **While `preview` is true the footer is the decision:** Cancel first and
 * focused on open — the APG's least-destructive-action guidance for a step that
 * is not easily reversed — then the confirm, labelled with what it commits to.
 * The confirm goes busy while the real run happens, never disabled; it is
 * disabled only when `confirmDisabled` says the write is genuinely unavailable,
 * and the content says why. Once the run is done `preview` is false and the
 * footer is a plain Close.
 */
export function ReviewDialog({
  title,
  description,
  preview,
  previewLabel = "Preview",
  confirmLabel,
  busyLabel,
  confirming,
  confirmDisabled = false,
  onConfirm,
  onClose,
  children,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  /** True for the un-run report; false once the write has happened. */
  preview: boolean
  /** The badge beside the title while previewing — "Preview", "Not sent yet". */
  previewLabel?: string
  /** What the confirm commits to: "Run Import", "Post 42 entries — $1,204.00". */
  confirmLabel: React.ReactNode
  /** Announced to screen readers while the confirmed run is in flight. */
  busyLabel: string
  confirming: boolean
  confirmDisabled?: boolean
  onConfirm: () => void
  onClose: () => void
  children: React.ReactNode
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        size="report"
        // Via `onOpenAutoFocus`, never `autoFocus` — that one hijacks
        // screen-reader focus on load (`a11y-baseline.md`).
        onOpenAutoFocus={
          preview
            ? (event) => {
                event.preventDefault()
                cancelRef.current?.focus()
              }
            : undefined
        }
      >
        <ModalHeader
          title={
            <>
              {title}
              {preview ? <Badge variant="secondary">{previewLabel}</Badge> : null}
            </>
          }
          description={description}
        />
        <ModalBody>{children}</ModalBody>
        {preview ? (
          <ModalFooter>
            <Button ref={cancelRef} variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={confirmDisabled}>
              {/* A reserved slot, so the spinner does not move the label. */}
              <BusySlot busy={confirming} />
              {confirmLabel}
              <BusyStatus busy={confirming}>{busyLabel}</BusyStatus>
            </Button>
          </ModalFooter>
        ) : (
          <ModalFooter showCloseButton />
        )}
      </DialogContent>
    </Dialog>
  )
}
