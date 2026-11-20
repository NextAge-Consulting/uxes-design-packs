// ui-status: approved
// ui-block: Breadcrumb
import { ChevronRight } from "lucide-react"

import { DefaultNavLink, type NavLinkComponent } from "@design-pack/ui/components/app-shell/nav-types"

/**
 * Where a nested screen sits — the list, then each record above this one, then this
 * screen — for screens more than one level below a list, as a record's own page and the
 * screens under it are (`form-layout.md`). Every level above is a link; the last is this
 * screen, marked the current page and not a link. It wraps on a narrow screen.
 *
 * A screen one level below its list keeps its own way back; this is only for nesting.
 * `linkComponent` is the app's router link, given an `href`, as `NavTree` takes it — this
 * package imports no router.
 */
function Breadcrumb<Href extends string>({
  above,
  current,
  linkComponent,
}: {
  /** The levels above this screen, outermost first — each a link. */
  above: ReadonlyArray<{ label: string; href: Href }>
  /** This screen. */
  current: string
  linkComponent?: NavLinkComponent<Href>
}) {
  const Link = (linkComponent ?? DefaultNavLink) as NavLinkComponent<Href>
  const separator = <ChevronRight aria-hidden className="size-icon-body shrink-0 text-muted-foreground" />
  return (
    <nav aria-label="Breadcrumb">
      <ol className="m-0 flex list-none flex-wrap items-center gap-tight p-0 type-body">
        {above.map((item, i) => (
          <li key={item.href} className="flex min-w-0 items-center gap-tight">
            {i > 0 ? separator : null}
            <Link
              href={item.href}
              className="inline-flex min-h-control-affix items-center rounded-stamp text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {item.label}
            </Link>
          </li>
        ))}
        <li className="flex min-w-0 items-center gap-tight">
          {above.length > 0 ? separator : null}
          <span aria-current="page" className="font-strong text-foreground">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  )
}

export { Breadcrumb }
