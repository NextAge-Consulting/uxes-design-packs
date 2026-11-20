// ui-status: approved
// ui-block: FieldGroup
import type * as React from "react"

import { cn } from "@design-pack/ui/lib/utils"

/**
 * A named group of PEER fields — independent concerns about one record,
 * scanned side by side, any one of which the reader might care about alone.
 *
 * The other half of the grouping rule: a **rule** separates a SEQUENCE (you
 * read one region then the next and the order matters), a **card** separates
 * PEERS (nothing in the layout says these belong together unless a boundary
 * does). The test is whether swapping the order would change how it reads
 * (`ui-patterns/references/form-layout.md` → Grouping fields).
 *
 * **A card is ALWAYS named.** Cards are scanned laterally with no reading order
 * to lean on, and a card asserts "these belong together and those do not" — an
 * unnamed assertion the reader cannot check. The eyebrow heading is that name.
 *
 * **Cards hold SHORT fields.** Long-form text, tables and dual lists get a
 * full-width region instead — a `minmax(230px, 1fr)` track squeezes them. Field
 * count is the wrong metric: one dual-list is half a screen tall and one field.
 *
 * Lay several out with {@link FieldCardGrid}, which owns the auto-fit track.
 */
function FieldCard({
  title,
  icon: Icon,
  children,
  className,
  ...props
}: {
  /** The eyebrow heading. Required — see above. */
  title: string
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
} & React.ComponentProps<"section">) {
  return (
    <section
      data-slot="field-card"
      className={cn(
        "flex flex-col gap-3 rounded-container border-frame border-border-subtle p-4",
        className
      )}
      {...props}
    >
      <h4 className="flex items-center gap-2 type-group-heading text-muted-foreground">
        {Icon ? <Icon aria-hidden className="size-3.5" /> : null}
        {title}
      </h4>
      {/* The card's own inner field grid. One column by default so short
          fields stack; a caller with genuinely paired fields passes its own
          grid inside. */}
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

/**
 * The container a row of {@link FieldCard}s sits in.
 *
 * `repeat(auto-fit, minmax(230px, 1fr))` — the number of columns follows the
 * available width rather than a breakpoint, so the same markup reads correctly
 * in a full-bleed record screen and in a `max-w-3xl` form. 230px is the width
 * below which a label and a short input stop fitting on one line.
 */
function FieldCardGrid({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-card-grid"
      className={cn(
        "grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]",
        className
      )}
      {...props}
    />
  )
}

export { FieldCard, FieldCardGrid }
