// ui-status: approved
// ui-atom
import type * as React from "react"

/**
 * Icon shape shared by every nav item — structurally compatible with a lucide
 * icon component without the UI package taking a type dependency on lucide's export shape.
 */
export type NavIcon = React.ComponentType<{
  className?: string
  "aria-hidden"?: boolean
}>

/**
 * One entry in the top module bar or the nav tree.
 *
 * Generic over the href type so the consuming app can narrow it to its router's
 * union of valid routes. Defaults to `string`, which is what the Claude Design
 * feed renders with (plain anchors, no router present).
 */
export interface NavItem<Href extends string = string> {
  /** Stable identity — also the active-state comparison key. */
  key: string
  label: string
  href: Href
  icon?: NavIcon
  /**
   * Optional subheading this item sits under, within its module.
   *
   * Most modules are a short flat list and set nothing. A module holding
   * genuinely different KINDS of screen uses this so they never read as one
   * undifferentiated list: preferences (small forms) and lookup-table
   * maintenance (grids) belong in one module but must not blur together.
   *
   * Consecutive items sharing a group render under one subheading, so ORDER
   * defines the grouping — an item that jumps back to an earlier group starts a
   * second subheading with the same name rather than joining the first.
   */
  group?: string
}

/**
 * The anchor the nav renders. Defaults to {@link DefaultNavLink} — a plain
 * `<a>` — so these components render standalone in the design feed with no
 * router present.
 *
 * The app supplies a one-line adapter over its router, which keeps the UI package free of
 * any router dependency. Because `Href` is generic, the adapter is fully typed
 * and needs no cast:
 *
 *   type AppRoute = LinkProps["to"]
 *   const RouterLink: NavLinkComponent<AppRoute> = ({ href, ...props }) => (
 *     <Link to={href} {...props} />
 *   )
 */
export type NavLinkComponent<Href extends string = string> = React.ComponentType<
  { href: Href } & React.AnchorHTMLAttributes<HTMLAnchorElement>
>

export const DefaultNavLink: NavLinkComponent = ({ href, children, ...rest }) => (
  <a href={href} {...rest}>
    {children}
  </a>
)
