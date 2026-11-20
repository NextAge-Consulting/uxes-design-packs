// ui-status: approved
// ui-block: FieldGroup
import type * as React from "react"

/**
 * A titled region inside a form section, separated from what is above it by a
 * rule — "Advanced options" under a form's main settings. Its heading takes the
 * section-heading role, the same weight as the groups inside it.
 *
 * `aside` sits on the heading's line: a count or summary of what the region holds.
 */
export function Subsection({
  heading,
  aside,
  children,
}: {
  heading: React.ReactNode
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 border-t-frame border-border-subtle pt-4">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="type-section-heading">{heading}</h3>
        {aside}
      </div>
      {children}
    </section>
  )
}
