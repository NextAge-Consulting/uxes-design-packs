// ui-status: pending
// ui-content
import { AppShell, AppShellBrand, AppShellTopBar } from '@design-pack/ui/components/app-shell/app-shell'
import { NavTree, type NavTreeModule } from '@design-pack/ui/components/app-shell/nav-tree'
import type { NavLinkComponent } from '@design-pack/ui/components/app-shell/nav-types'
import { ThemeToggle } from '@design-pack/ui/components/app-shell/theme-toggle'
import { TooltipProvider } from '@design-pack/ui/components/ui/tooltip'
import { type ReactElement, type ReactNode, useState } from 'react'
import { AccountMenu } from '../components/AccountMenu'
import { useTheme } from '../theme/useTheme'

/**
 * The back office, assembled: the top bar with the brand, the theme switch and the
 * account menu; the rail; and the screen in the one region that scrolls. An app's root
 * layout is this with its own brand, navigation, person and sign-out in place of the
 * props, and its router's outlet as the child.
 *
 * The rail's open modules and favourites are held here for the life of the page; an app
 * saves them per person (`nav-tree-favorites.md`).
 */
export function BackOfficeShell<Href extends string = string>({
  brand,
  modules,
  activeKey,
  activeSection,
  linkComponent,
  person,
  signOut,
  children,
}: {
  /** The home link holding the product mark: the app's own router link. */
  brand: ReactElement
  modules: readonly NavTreeModule<Href>[]
  /** The rail entry of the screen showing, as `module/item`. */
  activeKey?: string
  activeSection?: string
  linkComponent?: NavLinkComponent<Href>
  person: { name: string; detail?: string | null }
  signOut: { leave: () => void; leaving: boolean; problem: string | null }
  children: ReactNode
}) {
  const { theme, toggle } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>(() => (activeSection ? [activeSection] : modules.slice(0, 1).map((m) => m.key)))
  const flip = (list: string[], key: string) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key])

  return (
    // One provider for the whole app: every icon-only button shows a tooltip.
    <TooltipProvider>
      <AppShell
        topBar={
          <AppShellTopBar>
            <AppShellBrand>{brand}</AppShellBrand>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle theme={theme} onToggle={toggle} />
              <AccountMenu name={person.name} detail={person.detail} signOut={signOut} />
            </div>
          </AppShellTopBar>
        }
        sideBar={
          <NavTree
            modules={modules}
            favorites={favorites}
            onToggleFavorite={(key) => setFavorites((list) => flip(list, key))}
            expandedModules={expanded}
            onToggleModule={(key) => setExpanded((list) => flip(list, key))}
            activeKey={activeKey}
            activeSection={activeSection}
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((c) => !c)}
            linkComponent={linkComponent}
          />
        }
      >
        {children}
      </AppShell>
    </TooltipProvider>
  )
}
