// ui-status: approved
// ui-block: ModalShell
// ui-behaviour: loading-states.md
import type * as React from "react"

import { BusySlot, BusyStatus } from "@design-pack/ui/components/busy-status"
import { RecordMark } from "@design-pack/ui/components/record-mark"
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

/**
 * Screen content as a popup — a browse, a lookup, a form whose actions live
 * inside it — ending with Close.
 *
 * The frame: title and description, the content in `ModalSection`s, and a Close
 * footer. **It has no primary action**: whatever the content does, it does from
 * inside itself (a row's button, a form's submit), so a button in the corner
 * would be a control with nothing to commit. A dialog that ends by committing a
 * write is `ReviewDialog`; one that asks a single question is `ConfirmDialog`.
 *
 * `wide` is for content that is a table or a report; `default` for a short form.
 */
export function ModalShell({
  title,
  description,
  width = "default",
  onClose,
  onOpenAutoFocus,
  children,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  width?: "default" | "wide"
  onClose: () => void
  /** Radix's open-focus hook, for a frame that must focus something specific. */
  onOpenAutoFocus?: React.ComponentProps<typeof DialogContent>["onOpenAutoFocus"]
  children: React.ReactNode
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent size={width === "wide" ? "report" : "default"} onOpenAutoFocus={onOpenAutoFocus}>
        <ModalHeader title={title} description={description} />
        {width === "wide" ? <ModalBody>{children}</ModalBody> : children}
        {/* The atom's own dismiss — an OUTLINE button wired to the primitive. */}
        <ModalFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}

/**
 * A notice that must be acknowledged: `ModalShell`'s frame with no way out but its
 * one button — no Close, no X, and Escape or a click outside does nothing, so
 * closing it always means the reader acted on it. `failure` says why acknowledging
 * did not go through, in a box directly above the button.
 */
export function ModalNotice({
  title,
  acknowledgeLabel,
  busyLabel,
  busy,
  failure,
  onAcknowledge,
  action,
  children,
}: {
  title: React.ReactNode
  acknowledgeLabel: string
  busyLabel: string
  busy: boolean
  failure?: string | null
  onAcknowledge: () => void
  /** An optional link in its own words, under the text — as `PageBanner`'s. */
  action?: { label: string; href: string } | null
  /** The notice's text, one `ModalNoticeText` per paragraph. */
  children: React.ReactNode
}) {
  return (
    <Dialog open>
      <DialogContent
        size="report"
        role="alertdialog"
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <ModalHeader title={title} />
        <ModalBody>
          {children}
          {action ? (
            <a href={action.href} className="self-start type-body font-emphasis text-primary-ink underline underline-offset-4">
              {action.label}
            </a>
          ) : null}
        </ModalBody>
        <ModalFooter failure={failure && !busy ? failure : null}>
          <Button onClick={onAcknowledge}>
            <BusySlot busy={busy} />
            {acknowledgeLabel}
          </Button>
          <BusyStatus busy={busy}>{busyLabel}</BusyStatus>
        </ModalFooter>
      </DialogContent>
    </Dialog>
  )
}

/** One paragraph of a `ModalNotice`'s text. */
export function ModalNoticeText(props: React.ComponentProps<"p">) {
  return <p className="type-body" {...props} />
}

/**
 * The scrolling region of a wide dialog, between its pinned title and footer.
 * `min-h-0` lets it shrink below its content so the dialog's height cap holds.
 */
export function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col gap-4 scroll-region">{children}</div>
}

/**
 * A dialog's title row and the sentence under it. Shared by every dialog frame.
 * `icon` is a record's mark, for a dialog that is a record's identity heading.
 */
export function ModalHeader({
  title,
  description,
  icon,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ComponentProps<typeof RecordMark>["icon"]
}) {
  return (
    <DialogHeader>
      <DialogTitle>
        {icon ? <RecordMark icon={icon} /> : null}
        {title}
      </DialogTitle>
      {description ? <DialogDescription>{description}</DialogDescription> : null}
    </DialogHeader>
  )
}

/**
 * A dialog's footer, separated from the content above it by the divider.
 * `showCloseButton` adds the atom's own Close.
 */
export function ModalFooter({
  showCloseButton,
  failure,
  children,
}: {
  showCloseButton?: boolean
  /** Why the last action failed, in words for the person — a box directly above the buttons. */
  failure?: string | null
  children?: React.ReactNode
}) {
  // The divider is this component's own element, so the footer atom keeps its
  // look and nothing repaints it from outside.
  return (
    <div className="flex flex-col gap-related border-t-frame border-border-subtle pt-4">
      {failure ? (
        <Alert variant="destructive">
          <AlertDescription>{failure}</AlertDescription>
        </Alert>
      ) : null}
      <DialogFooter showCloseButton={showCloseButton}>{children}</DialogFooter>
    </div>
  )
}

/**
 * One region of a dialog's content, separated from what is above it by a border
 * — the theme is flat, so separation is a border, never a shadow.
 *
 * `heading` is a group heading over the region.
 */
export function ModalSection({
  heading,
  children,
}: {
  heading?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2 border-t-frame border-border-subtle pt-4">
      {heading ? <h3 className="type-surface-heading">{heading}</h3> : null}
      {children}
    </section>
  )
}
