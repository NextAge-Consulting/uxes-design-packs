// ui-status: approved
// ui-atom
import type { ComponentType } from "react"
import { Checkbox } from "@design-pack/ui/components/ui/checkbox"
import { Label } from "@design-pack/ui/components/ui/label"
import { useChosen } from "@design-pack/ui/hooks/use-chosen"

type OptionIcon = ComponentType<{ className?: string; "aria-hidden"?: boolean }>

/**
 * One facet of a browse filter, as a checklist that starts fully ticked.
 *
 * ## Everything on by default, and you switch things off
 *
 * The inverse of the usual "pick one" filter, and deliberately. What a person
 * may see is decided by their permissions; this control shows them that whole
 * set and lets them narrow it. So the list doubles as the answer to "what is
 * there?", and an option they cannot read never appears at all — rather than
 * appearing and returning nothing.
 *
 * ## Checkboxes rather than a multi-select
 *
 * Under roughly seven options, opening a control to discover what is inside it
 * costs more than the space it saves — which is why faceted filtering across
 * catalogues and log viewers is overwhelmingly checkbox lists. And a collapsed
 * control would hide the very thing this design depends on: seeing the whole
 * permitted set at a glance.
 *
 * ## A facet with ONE option still renders (Zero Tolerance)
 *
 * The obvious call is to hide it — a lone checkbox narrows nothing, the same
 * way a list that fits needs no pager. **That analogy is wrong here**, and the
 * difference is this control's second job.
 *
 * A pager only ever controls. This facet also INFORMS: the list is the answer to
 * "what is in here, and what am I allowed to see?". Hide it and the reader
 * cannot tell whether there is one value, or no such facet, or other values
 * their permissions withhold — while the table beside them shows that very
 * column. The single ticked box says "one system exists and you can see it",
 * which is information, not a dead control.
 */
export function FacetChecklist<T extends string>({
  legend,
  options,
  labels,
  icons,
  hidden,
  onToggle,
}: {
  legend: string
  /** Every value this user may see. */
  options: readonly T[]
  labels: Record<T, string>
  /** An icon before an option's label, where the options have one. */
  icons?: Partial<Record<string, OptionIcon>>
  /** The values currently switched OFF. */
  hidden: ReadonlySet<string>
  onToggle: (value: T, on: boolean) => void
}) {
  const [shown, choose] = useChosen(hidden, [...hidden].sort().join("|"))
  const toggle = (value: T, on: boolean) => {
    const next = new Set(shown)
    if (on) next.delete(value)
    else next.add(value)
    choose(next)
    onToggle(value, on)
  }
  return (
    // A group of related checkboxes is a fieldset with a legend, never a div
    // with a heading (a11y-baseline.md) — that is what announces the group and
    // its name together.
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 type-field-label">{legend}</legend>

      {options.map((value) => {
        // The legend is prose ("Source system"), and an id with a space in it
        // is not addressable by a CSS selector or querySelector — which is what
        // the Label's htmlFor pairing rides on.
        const id = `facet-${legend.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${value}`

        const Icon: OptionIcon | undefined = icons?.[value]
        return (
          <div key={value} className="flex items-center gap-2">
            <Checkbox
              id={id}
              checked={!shown.has(value)}
              onCheckedChange={(next) => toggle(value, next === true)}
            />
            <Label htmlFor={id} kind="option">
              {Icon ? <Icon aria-hidden className="size-icon-body" /> : null}
              {labels[value]}
            </Label>
          </div>
        )
      })}
    </fieldset>
  )
}
