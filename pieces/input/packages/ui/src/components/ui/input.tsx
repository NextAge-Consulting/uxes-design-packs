// ui-status: approved
// ui-atom
import type * as React from "react"
import { useState } from "react"
import { cva } from "class-variance-authority"
import { Eye, EyeOff, Search, X } from "lucide-react"

import { IconButton } from "@design-pack/ui/components/icon-button"
import { cn } from "@design-pack/ui/lib/utils"

// THE field look — border, fill, radius, type, focus, invalid, read-only and disabled —
// defined once. Every control that looks like a field is built from this: the
// Input and Textarea below, the DateField trigger, the Combobox shell. A hand
// copy of these classes picks up its own focus and disabled treatment and
// nothing notices, so build from this instead.
//
// `part` says what the classes land on:
//   control — the focusable element itself (an <input>, a trigger <button>)
//   shell   — a box wrapping the focusable element (the Combobox), which takes
//             focus and disabled from what is inside it
//
// Read-only is keyed on `aria-readonly`, never `:read-only`, which a <button>
// trigger matches too. It keeps the box's size, focus and full-contrast text, and
// drops only the fill and the solid edge, as Carbon and SAP Fiori draw it; disabled
// is the greyed-out state.
const fieldVariants = cva(
  "w-full min-w-0 rounded-control border-line border-input bg-field type-form-control transition-[color,box-shadow] outline-none",
  {
    variants: {
      part: {
        control:
          "px-field-inset placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-feedback-danger aria-invalid:ring-feedback-danger/20 disabled:cursor-not-allowed disabled:border-disabled-border disabled:bg-disabled disabled:text-disabled-foreground aria-readonly:border-dashed aria-readonly:bg-transparent",
        shell:
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-feedback-danger has-aria-invalid:ring-feedback-danger/20 data-disabled:pointer-events-none data-disabled:border-disabled-border data-disabled:bg-disabled data-disabled:text-disabled-foreground",
      },
    },
    defaultVariants: { part: "control" },
  }
)

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldVariants(),
        "h-control py-1 selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:type-button-label file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

// A filter box: an Input with the search glyph inside its leading edge, and — given
// `onClear` — a Clear search button inside its trailing edge while it holds text.
// `className` places the whole box; everything else goes to the input.
function SearchInput({
  className,
  onClear,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { onClear?: () => void }) {
  const clearable = !!onClear && String(props.value ?? "") !== ""
  return (
    <div data-slot="search-input" className={cn("relative", className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input className={cn("pl-field-affix-inset", onClear && "pr-field-affix-inset")} {...props} />
      {clearable ? (
        <IconButton
          label="Clear search"
          icon={X}
          size="icon-affix"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          // Focus stays in the box: leaving it would run its own search first.
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClear}
        />
      ) : null}
    </div>
  )
}

// A password box: an Input with a Show password button inside its trailing edge that
// switches what was typed between dots and plain text. `className` places the whole
// box; everything else goes to the input.
function PasswordInput({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  const [shown, setShown] = useState(false)
  return (
    <div data-slot="password-input" className={cn("relative", className)}>
      <Input type={shown ? "text" : "password"} className="pr-field-affix-inset" {...props} />
      <IconButton
        label={shown ? "Hide password" : "Show password"}
        icon={shown ? EyeOff : Eye}
        size="icon-affix"
        className="absolute top-1/2 right-1 -translate-y-1/2"
        aria-pressed={shown}
        disabled={props.disabled}
        // Focus stays in the box, so typing carries on after a look.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setShown((current) => !current)}
      />
    </div>
  )
}

/**
 * An input for a figure — an amount, a percentage, a quantity: its `unit` 8px before
 * the box, the typed figure right-aligned in tabular digits so it lines up with the
 * figures around it. In a `SummaryList`, set `figuresAlign="field"` so the plain figures
 * line up with it. `className` and every other prop go to the input box; the unit sits
 * outside it.
 */
function FigureInput({
  unit,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { unit?: React.ReactNode }) {
  return (
    <div data-slot="figure-input" className="flex items-center justify-end gap-2">
      {unit ? (
        <span aria-hidden className="type-body text-muted-foreground">
          {unit}
        </span>
      ) : null}
      <Input inputMode="decimal" className={cn("text-right tabular-nums", className)} {...props} />
    </div>
  )
}

export { Input, SearchInput, PasswordInput, FigureInput, fieldVariants }
