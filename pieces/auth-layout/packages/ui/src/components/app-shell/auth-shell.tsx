// ui-status: approved
// ui-block: AuthShell
import type * as React from "react"

import { Card } from "@design-pack/ui/components/ui/card"
import { cn } from "@design-pack/ui/lib/utils"

/**
 * The frame around a signed-out screen — sign in, set a password or choose a new one, a
 * task done without signing in: the page ground, the task centred in the space above an
 * optional footer.
 *
 * `AuthShellBody` holds what is centred, 24px apart: the brand mark, the task — an
 * `AuthCard`, or a wider layout of its own — and a line of help under it. Anything
 * after the body (a row of linked images) sits at the foot of the page.
 */
function AuthShell({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="auth-shell"
      className={cn("flex min-h-screen flex-col items-center gap-6 bg-surface pb-6 edge-top-6 edge-page", className)}
      {...props}
    />
  )
}

// `layout` says how the task sits:
//   centred — one card, centred in the space above the footer
//   flowing — a longer task that grows as it is filled (a multi-step form), starting
//             under the mark so nothing moves as it grows
function AuthShellBody({
  className,
  layout = "centred",
  ...props
}: React.ComponentProps<"div"> & { layout?: "centred" | "flowing" }) {
  return (
    <div
      data-slot="auth-shell-body"
      className={cn(
        "flex w-full grow flex-col items-center gap-6",
        layout === "centred" && "justify-center",
        className
      )}
      {...props}
    />
  )
}

// The one narrow card a signed-out task sits on; the screen supplies its content.
function AuthCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return <Card className={cn("w-full max-w-105", className)} {...props} />
}

// The foot of a signed-out page, ruled off from the task above it: a centred row of
// links that wraps — linked images, each at one shared height.
function AuthShellFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="auth-shell-footer"
      className={cn(
        "flex w-full max-w-auth-content flex-wrap items-center justify-center gap-4 border-t-frame border-border-subtle pt-6 [&_a]:flex [&_img]:h-footer-mark [&_img]:w-auto",
        className
      )}
      {...props}
    />
  )
}

export { AuthShell, AuthShellBody, AuthCard, AuthShellFooter }
