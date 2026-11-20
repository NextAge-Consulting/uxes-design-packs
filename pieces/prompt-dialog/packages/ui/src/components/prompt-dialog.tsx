// ui-status: approved
// ui-block: PromptDialog
// ui-behaviour: documents.md, loading-states.md, saving.md
import type * as React from "react"

import { BusySlot, BusyStatus } from "@design-pack/ui/components/busy-status"
import { ReportLink } from "@design-pack/ui/components/report-link"
import { Alert, AlertDescription } from "@design-pack/ui/components/ui/alert"
import { Button } from "@design-pack/ui/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@design-pack/ui/components/ui/dialog"

/** An action the dialog runs: it submits, goes busy and announces what it is doing. */
type PromptAction = {
  /** The action, as a verb: "Send Reset Link", never "OK". */
  confirmLabel: string
  onSubmit: () => void
  busyLabel: string
  busy?: boolean
  report?: never
}
/** A report the dialog's choices make: its link is the action. */
type PromptReport = {
  report: { href: string | null }
  confirmLabel?: never
  onSubmit?: never
  busyLabel?: never
  busy?: never
}

/**
 * Asks for one value before an action proceeds — "the email on your account" before a
 * reset link is sent — then, with `outcome`, says what was done and ends Done.
 *
 * The caller supplies the field as `children`, and a failed attempt as `failure`, a box
 * directly above the buttons. An action's dialog is its form, so Enter submits it, and its
 * confirm goes busy while it runs, never disabled.
 *
 * `report` makes the action opening a generated report (`documents.md`): a `ReportLink`
 * to its address, which opens it in a new tab and closes the dialog — the link is the
 * action, so Enter does nothing. While the choices cannot make a report its `href` is
 * null: the report is unavailable, so the button is disabled and `failure` says why.
 *
 * A whole record is an `EntityModal`; a question with no input is a `ConfirmDialog`.
 */
export function PromptDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  busyLabel,
  busy = false,
  onSubmit,
  report,
  outcome,
  failure,
  children,
}: (PromptAction | PromptReport) & {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  cancelLabel?: string
  /** What was done, shown in place of the prompt once it is. */
  outcome?: { title: React.ReactNode; description?: React.ReactNode; doneLabel?: string }
  /** Why the last attempt failed, in words for the person — a box directly above the buttons. */
  failure?: string | null
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{outcome ? outcome.title : title}</DialogTitle>
          {(outcome ? outcome.description : description) ? (
            <DialogDescription>{outcome ? outcome.description : description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {outcome ? (
          <DialogFooter>
            <Button type="button" onClick={() => onOpenChange(false)}>
              {outcome.doneLabel ?? "Done"}
            </Button>
          </DialogFooter>
        ) : (
          <form
            noValidate
            className="contents"
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit?.()
            }}
          >
            {children}
            {failure && !busy ? (
              <Alert variant="destructive">
                <AlertDescription>{failure}</AlertDescription>
              </Alert>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {cancelLabel}
              </Button>
              {report ? (
                <ReportLink href={report.href} onClick={() => onOpenChange(false)} />
              ) : (
                <Button type="submit">
                  <BusySlot busy={busy} />
                  {confirmLabel}
                </Button>
              )}
              {busyLabel ? <BusyStatus busy={busy}>{busyLabel}</BusyStatus> : null}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
