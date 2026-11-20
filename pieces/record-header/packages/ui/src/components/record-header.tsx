// ui-status: approved
// ui-block: RecordHeader
import type * as React from "react"

import { FacetTile } from "@design-pack/ui/components/facet-tile"
import { RecordMark } from "@design-pack/ui/components/record-mark"
import { StatReadout } from "@design-pack/ui/components/stat-readout"
import { cn } from "@design-pack/ui/lib/utils"

/**
 * The header of a record screen: where it is filed, what it is, what state it
 * is in, its derived numbers, and the facet tiles that open its field panels.
 *
 * One component because every record screen has the same header and the
 * alternative is each route growing its own copy. Counts, tiles and badges are props; the
 * arrangement is not negotiable per screen.
 *
 * ## Why the KPIs live UP HERE and not in a panel
 *
 * The facet panels are mutually exclusive: open Pricing & Stock and every
 * identity field goes off screen. Anything the user needs while working in ANY
 * facet therefore belongs in the header — that is what the region is for. A
 * nested screen's `Breadcrumb` sits above the header, never in it.
 *
 * ## It renders no `<form>` and knows no router
 *
 * The caller wraps it in the `<form>` that owns the submit, and passes the save
 * control as `footer` — which keeps that control a DOM descendant of the form,
 * where a `type="submit"` button has to be to do anything at all.
 *
 * The save sits at the END of the parent record's regions and ABOVE the child
 * ledgers the caller renders below — its scope is everything in this card and
 * nothing in the tabs, which save themselves
 * (`ui-patterns/references/form-layout.md`).
 */
function RecordHeader<Facet extends string>({
  icon,
  title,
  titleClassName,
  badges,
  subtitle,
  aside,
  notice,
  stats,
  facets,
  activeFacet = null,
  footer,
  children,
  className,
  ...props
}: {
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  title: string
  titleClassName?: string
  /** Status badges, beside the heading. */
  badges?: React.ReactNode
  subtitle?: React.ReactNode
  /** The record's own state control — the Active switch. Top right. */
  aside?: React.ReactNode
  /** A save result or a conflict. Rendered below the identity row. */
  notice?: React.ReactNode
  /** Derived numbers. Readouts, never inputs — a KPI the user can type into is
   *  not derived. Omit entirely for a record that has none. */
  stats?: ReadonlyArray<{ label: string; value: React.ReactNode }>
  /** The tiles that open the field panels. Exactly one is open at a time; the
   *  caller owns which, and renders it as `children`. */
  facets?: ReadonlyArray<{
    key: Facet
    icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
    label: string
    value?: React.ReactNode
    onClick: () => void
  }>
  /** Which facet is open, if any. */
  activeFacet?: Facet | null
  /** The open facet's panel. */
  children?: React.ReactNode
  /** The save control. Must be inside the caller's `<form>` — it is, because
   *  the form wraps this whole component. */
  footer?: React.ReactNode
} & Omit<React.ComponentProps<"div">, "title" | "children">) {
  const divided = "border-t-frame border-border-subtle pt-4"

  return (
    <div
      data-slot="record-header"
      className={cn(
        "flex flex-col gap-4 rounded-container border-frame border-border bg-card p-4",
        className
      )}
      {...props}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {icon ? <RecordMark icon={icon} /> : null}
            <h1
              className={cn(
                "type-screen-title",
                titleClassName
              )}
            >
              {title}
            </h1>
            {badges}
          </div>
          {subtitle ? (
            <p className="type-body text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {aside}
      </div>

      {notice}

      {stats && stats.length > 0 ? (
        <div
          className={cn(
            "grid grid-cols-2 gap-figures sm:grid-cols-3 lg:grid-cols-6",
            divided
          )}
        >
          {stats.map((stat) => (
            <StatReadout key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      ) : null}

      {facets && facets.length > 0 ? (
        <div
          className={cn(
            "grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6",
            divided
          )}
        >
          {facets.map((facet) => (
            <FacetTile
              key={facet.key}
              icon={facet.icon}
              label={facet.label}
              value={facet.value}
              active={activeFacet === facet.key}
              onClick={facet.onClick}
            />
          ))}
        </div>
      ) : null}

      {children}

      {footer ? <div className={divided}>{footer}</div> : null}
    </div>
  )
}

export { RecordHeader }
