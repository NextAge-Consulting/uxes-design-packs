// ui-status: approved
// ui-block: ConfirmDialog
// ui-behaviour: loading-states.md, table-row-actions.md
import type * as React from "react"
import { useRef } from "react"

import { BusySlot, BusyStatus } from "@design-pack/ui/components/busy-status"
import { Button } from "@design-pack/ui/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@design-pack/ui/components/ui/dialog"

/**
 * One short question, answered yes or no — "Delete this note?".
 *
 * Small, with no content regions: if answering needs a report to read first, it
 * is a `ReviewDialog`. Cancel is focused on open, the safe answer. `destructive`
 * paints the confirm as the error family for an answer that removes something.
 * The confirm goes busy while it runs, never disabled.
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  busyLabel,
  destructive = false,
  confirming = false,
  onConfirm,
  onCancel,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  /** The answer, as a verb: "Delete Note", never "OK". */
  confirmLabel: string
  /** The safe answer, when "Cancel" would not say it — "Keep Editing". */
  cancelLabel?: string
  busyLabel: string
  destructive?: boolean
  confirming?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          cancelRef.current?.focus()
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter>
          <Button ref={cancelRef} variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? "destructive" : "default"} onClick={onConfirm}>
            <BusySlot busy={confirming} />
            {confirmLabel}
            <BusyStatus busy={confirming}>{busyLabel}</BusyStatus>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
