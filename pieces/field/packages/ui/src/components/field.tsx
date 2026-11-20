// ui-status: approved
// ui-atom
// ui-behaviour: inline-form.md, saving.md
import type * as React from "react"

import { Alert, AlertDescription } from "@design-pack/ui/components/ui/alert"
import { cn } from "@design-pack/ui/lib/utils"

/**
 * The rhythm of a short form that is not a record — sign in, choose a new password,
 * look up an account without signing in.
 *
 * `Field` is one field: its `Label`, its control, then a hint (`type-metadata`, muted)
 * or a `FieldError` under it, 8px apart. `FieldError` is why that one field's value was
 * refused, and nothing else: a failed save is `FieldStackActions`'s `failure`, a box
 * directly above the buttons (`saving.md`). `FieldStack` holds
 * the fields 16px apart, then `FieldStackActions` — the submit, 8px further down so
 * it reads as the end of the form rather than one more field; `layout="inline"` is a row
 * instead, primary first, 8px apart and wrapping, for a form inside a card — then
 * `FieldStackLinks`, the other ways out ("Forgot your password?"), stacked and centred —
 * or `layout="inline"`, side by side on one line and wrapping when narrow.
 *
 * `FieldRow` puts two or three short fields side by side inside the stack, 16px apart
 * like the fields above them: `short` is two equal columns that stay side by side on a
 * phone (expiry beside security code), `address` is city, state and ZIP at 2 : 1 : 1.2,
 * and `wide` is two equal columns that stack below a tablet (two long values, such as
 * two addresses).
 *
 * A record's form is `FormShell` with its bound fields; this is for the screens
 * around it.
 */
function FieldStack({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-stack" className={cn("flex flex-col gap-4", className)} {...props} />
}

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field" className={cn("flex flex-col gap-2", className)} {...props} />
}

const fieldRowLayouts = {
  short: "grid-cols-2",
  address: "grid-cols-[2fr_1fr_1.2fr]",
  wide: "grid-cols-1 md:grid-cols-2",
} as const

function FieldRow({
  layout,
  className,
  ...props
}: { layout: keyof typeof fieldRowLayouts } & React.ComponentProps<"div">) {
  return <div data-slot="field-row" className={cn("grid gap-4", fieldRowLayouts[layout], className)} {...props} />
}

const fieldStackActionsLayouts = {
  stacked: "mt-2 flex-col",
  inline: "flex-row flex-wrap items-center gap-2",
} as const

/** Why one field's value was refused, under that field. */
function FieldError({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="field-error" role="alert" className={cn("type-field-error text-feedback-danger", className)} {...props} />
}

/** `failure` is why the last save failed, in words for the person — a box directly above the buttons. */
function FieldStackActions({
  layout = "stacked",
  failure,
  className,
  children,
  ...props
}: { layout?: keyof typeof fieldStackActionsLayouts; failure?: string | null } & React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-stack-actions"
      className={cn("flex", fieldStackActionsLayouts[layout], className)}
      {...props}
    >
      {failure ? (
        <Alert variant="destructive">
          <AlertDescription>{failure}</AlertDescription>
        </Alert>
      ) : null}
      {children}
    </div>
  )
}

const fieldStackLinksLayouts = {
  stacked: "flex-col items-center gap-1",
  inline: "flex-row flex-wrap items-center gap-x-4 gap-y-1",
} as const

function FieldStackLinks({
  layout = "stacked",
  className,
  ...props
}: { layout?: keyof typeof fieldStackLinksLayouts } & React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-stack-links"
      className={cn("flex", fieldStackLinksLayouts[layout], className)}
      {...props}
    />
  )
}

export { FieldStack, Field, FieldError, FieldRow, FieldStackActions, FieldStackLinks }
