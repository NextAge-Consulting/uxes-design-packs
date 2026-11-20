// ui-status: approved
// ui-atom
import * as React from "react"

import { Field } from "@design-pack/ui/components/field"
import { FigureInput, Input } from "@design-pack/ui/components/ui/input"
import { Label } from "@design-pack/ui/components/ui/label"

/**
 * A value in a form that the reader may see but not change: a text box with its label
 * like every field beside it, drawn quiet — a dashed edge, no fill — so it lines up
 * with the form and is plainly not for typing into. It still takes focus, and its
 * value can be selected and copied; a screen reader announces it read-only.
 *
 * For a value inside a form. Facts read on their own, with no field to type into, are
 * `FactList`.
 *
 * `money` sets an amount as a money `FigureField` sets one — the $ before the box, the
 * figure right-aligned in tabular digits — so it lines up with the amounts typed
 * around it. A value given as lines — an address — reads on one line, comma-joined, as
 * an address typed into a box does. An empty value shows an em dash: a blank box reads as
 * one left unfilled.
 */
function ReadOnlyField({
  label,
  value,
  hint,
  money = false,
}: {
  label: string
  value: string | readonly string[] | null | undefined
  /** Why it cannot be changed here, where that is not obvious. */
  hint?: React.ReactNode
  money?: boolean
}) {
  const id = React.useId()
  const hintId = `${id}-hint`
  const text = typeof value === "string" || value == null ? value : value.filter(Boolean).join(", ")
  const box = {
    id,
    readOnly: true,
    "aria-readonly": true,
    value: text === "" || text == null ? "—" : text,
    "aria-describedby": hint ? hintId : undefined,
  } as const
  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      {money ? <FigureInput unit="$" {...box} /> : <Input {...box} />}
      {hint ? (
        <p id={hintId} className="type-hint text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </Field>
  )
}

export { ReadOnlyField }
