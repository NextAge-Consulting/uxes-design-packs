// ui-status: approved
// ui-atom
// ui-behaviour: loading-states.md
import type * as React from "react"

import { Spinner } from "@design-pack/ui/components/ui/spinner"

/**
 * The spoken half of a busy control.
 *
 * Pattern and sources: `.claude/skills/ui-patterns/references/loading-states.md`.
 *
 * A button that is working says so twice: visually with a spinner in its
 * reserved icon slot, and to a screen reader through this element. Neither the
 * button's label nor its width changes, so the control does not move under the
 * cursor mid-click and its accessible name stays stable for anyone reading it.
 *
 * ## Why not `aria-busy`
 *
 * `aria-busy` looks like the attribute for exactly this and is not. It is
 * announced inconsistently across screen readers, says nothing at the moment of
 * the press — you only hear it if you leave the control and come back — and in
 * some readers it causes the element's own contents to be skipped entirely, so
 * the button goes silent rather than informative. A polite live region is what
 * actually gets spoken.
 *
 * ## Why the element is always rendered
 *
 * A live region has to exist in the DOM before the text arrives; one mounted
 * with its message already in place is not announced. So this renders
 * unconditionally and swaps its own text content.
 */
export function BusyStatus({ busy, children }: { busy: boolean; children: string }) {
  return (
    <span aria-live="polite" className="sr-only">
      {busy ? children : ''}
    </span>
  )
}

/**
 * The reserved slot a busy button's spinner sits in, always present so the
 * button's width never changes when the spinner appears. Place it first inside
 * the button, and pair the button with a `BusyStatus`.
 */
export function BusySlot({
  busy,
  idle = null,
}: {
  busy: boolean
  /** What the slot shows when not busy — the button's icon, which the spinner replaces. */
  idle?: React.ReactNode
}) {
  return (
    <span className="inline-flex size-4 items-center justify-center">
      {busy ? <Spinner className="size-4" /> : idle}
    </span>
  )
}
