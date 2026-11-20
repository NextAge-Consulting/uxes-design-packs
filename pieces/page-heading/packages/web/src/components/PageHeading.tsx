// ui-status: approved
// ui-block: ScreenHeading
// ui-behaviour: page-heading.md
import { useRouterState } from '@tanstack/react-router'
import type { NavIcon } from '@design-pack/ui/components/app-shell/nav-types'
import { RecordMark } from '@design-pack/ui/components/record-mark'
import { createContext, type ReactNode, useContext } from 'react'

/**
 * The heading every routed screen opens with (`page-heading.md`).
 *
 * ## The icon identifies the SCREEN, and is resolved rather than chosen
 *
 * The rail carries icons on modules only — a screen is a text row there — so
 * this mark is the screen's own identity, not an echo of something you clicked.
 * It is what distinguishes one module's pages from each other when you arrive from
 * a favourite, a link, or a detail route.
 *
 * That makes WHERE it comes from the load-bearing part. It is resolved from the
 * live path against the app's one screen registry ({@link ScreenIcons}), never
 * re-picked per page: a screen cannot forget its icon, cannot pick a different one
 * from the one the app has recorded, and a route that moves takes its icon with it.
 *
 * Decorative here: `aria-hidden`, because the heading text beside it is already
 * the accessible name and announcing the icon would just repeat it.
 */
export function PageHeading({
  icon,
  title,
  description,
}: {
  /** Defaults to the icon recorded for this route; pass one only to override. */
  icon?: NavIcon
  title: string
  description?: string
}) {
  const resolved = useScreenIcon()
  const Icon = icon ?? resolved
  return (
    <header>
      <div className="flex items-center gap-3">
        {Icon ? <RecordMark icon={Icon} /> : null}
        <h1 className="type-screen-title">{title}</h1>
      </div>
      {description ? <p className="mt-2 max-w-[62ch] type-body text-muted-foreground">{description}</p> : null}
    </header>
  )
}

type IconForPath = (pathname: string) => NavIcon | undefined

const ScreenIconContext = createContext<IconForPath>(() => undefined)

/**
 * The app's screen registry, given once at the root: how a path finds its recorded
 * icon (each app's `navItemForPath` in `lib/navigation.ts`). A detail route inherits
 * its browse's icon there (prefix match), the same answer the rail gives.
 */
export function ScreenIcons({ iconFor, children }: { iconFor: IconForPath; children: ReactNode }) {
  return <ScreenIconContext.Provider value={iconFor}>{children}</ScreenIconContext.Provider>
}

/** The icon recorded for the screen the current route belongs to. */
export function useScreenIcon(): NavIcon | undefined {
  const iconFor = useContext(ScreenIconContext)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  return iconFor(pathname)
}
