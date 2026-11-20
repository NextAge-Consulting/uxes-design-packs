// ui-status: approved
// ui-block: AppShell
import type * as React from "react"

import { Slot } from "radix-ui"
import { cn } from "@design-pack/ui/lib/utils"

/**
 * App shell frame — the four regions of the application chrome:
 *
 *   topBar     — brand, system state, theme, user menu (no navigation)
 *   sideBar    — the nav tree (favourites + every module's screens)
 *   children   — one routed surface (list / master-detail / record)
 *   statusStrip — persistent system context
 *
 * Deliberately viewport-locked: only the main region scrolls, so the module
 * top bar and nav tree never scroll away in a dense data screen. No MDI, no
 * floating windows — every surface is a routed, shareable URL.
 *
 * See design.md → Layout.
 */
function AppShell({
  banner,
  topBar,
  sideBar,
  statusStrip,
  children,
  className,
  ...props
}: {
  /**
   * A band across the FULL viewport, above the top bar and outside every route.
   *
   * For a state the whole session is in, not a message about a screen — an
   * administrator viewing as somebody else has to see it on every screen, at
   * full width, and no route may be able to push it aside or hide it. A notice
   * about one record belongs inside that record's container instead.
   */
  banner?: React.ReactNode
  topBar?: React.ReactNode
  sideBar?: React.ReactNode
  statusStrip?: React.ReactNode
} & React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell"
      className={cn("flex h-screen flex-col overflow-hidden bg-surface text-foreground", className)}
      {...props}
    >
      {banner}
      {topBar}
      <div className="flex min-h-0 flex-1">
        {sideBar}
        <main className="min-w-0 flex-1 scroll-region bg-surface">{children}</main>
      </div>
      {statusStrip}
    </div>
  )
}

/** The 54px top band. Brand on the left, system actions right. */
function AppShellTopBar({ className, children, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="app-shell-topbar"
      className={cn(
        "flex h-[54px] shrink-0 items-center gap-4 border-b-frame border-border bg-card px-4",
        className
      )}
      {...props}
    >
      {children}
    </header>
  )
}

/**
 * Persistent system context strip (domain, user, role, license). It carries
 * operationally-relevant state its users read constantly — not decoration.
 */
/**
 * The product mark in the top bar, as the way home. The app passes its own link
 * as the child (`asChild` semantics) — the shell knows no router — and this
 * draws the link's focus ring around the mark.
 */
function AppShellBrand({ children }: { children: React.ReactElement }) {
  return (
    <Slot.Root
      data-slot="app-shell-brand"
      className="rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {children}
    </Slot.Root>
  )
}

function AppShellStatusStrip({ className, children, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="app-shell-status-strip"
      className={cn(
        "flex h-7 shrink-0 items-center gap-4 border-t-frame border-border bg-card px-4 type-status-strip text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </footer>
  )
}

export { AppShell, AppShellBrand, AppShellTopBar, AppShellStatusStrip }
