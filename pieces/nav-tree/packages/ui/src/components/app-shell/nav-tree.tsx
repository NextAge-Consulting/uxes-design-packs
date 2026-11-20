// ui-status: approved
// ui-block: NavRail
// ui-behaviour: nav-tree-favorites.md
import type * as React from "react"
import { Fragment, useEffect, useId, useRef, useState } from "react"
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  ChevronDown,
  Star,
} from "lucide-react"

import { cn } from "@design-pack/ui/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@design-pack/ui/components/ui/popover"
import { DefaultNavLink, type NavItem, type NavLinkComponent } from "./nav-types"
import { IconButton } from "@design-pack/ui/components/icon-button"

/**
 * NavTree — the left rail. Favourites pinned at the top, then every module as a
 * collapsible section holding its converted screens.
 *
 * Pattern, rationale and rejected alternatives:
 * `.claude/skills/ui-patterns/references/nav-tree-favorites.md`.
 *
 * Router-agnostic like every app-shell primitive: it renders whatever
 * `linkComponent` it is given and defaults to a plain `<a>`, so it works
 * standalone in the design feed. Generic over `Href` so the app can narrow it to
 * its router's union of real routes.
 *
 * ## Icons live on modules only
 *
 * A screen is a text row, everywhere it appears — in the rail, under a group
 * heading, and in a collapsed flyout. Icons on both levels put twenty glyphs in
 * a 188px column, which reads as texture competing with the labels you are
 * actually there to read. The modules keep theirs because in collapsed
 * mode the icon IS the module.
 *
 * A screen still HAS an icon (`NavItem.icon`) — its page heading renders it. The
 * rail simply does not.
 */

/** One module and the screens under it. */
export interface NavTreeModule<Href extends string = string> {
  key: string
  label: string
  icon?: NavItem<Href>["icon"]
  items: readonly NavItem<Href>[]
}

/** `<moduleKey>/<itemKey>` — the stable identity a favourite is stored under. */
export const favoriteKey = (moduleKey: string, itemKey: string) => `${moduleKey}/${itemKey}`

/**
 * Item rows and group headings share this left padding: the module row's
 * px-2 (8) + icon (16) + gap-2 (8). An item's label therefore begins
 * exactly where its module's label does — one text column down the rail, with
 * weight carrying the hierarchy.
 *
 * The disclosure chevron is NOT in this sum: it is right-aligned on the module
 * row, which is what keeps the left edge a single column of icons and buys
 * every label 20px it previously spent on a control.
 */
const LABEL_INDENT = "pl-8"

/**
 * Items sit one small step in from their subheading — 8px, not a second full
 * indent level. The rail is a TREE, so a screen has to read as subordinate to
 * the heading above it; without the step, heading and item share a left edge
 * and the only thing separating them is type, which is not enough on its own.
 */
const ITEM_INDENT = "pl-nav-item-indent"

interface NavTreeProps<Href extends string = string> {
  modules: readonly NavTreeModule<Href>[]
  /** Stored favourite keys, in user order. Unknown keys are ignored. */
  favorites: readonly string[]
  onToggleFavorite: (key: string) => void
  /**
   * Which module sections are open. Sections are INDEPENDENT — any number open,
   * including none. A single-open accordion cannot express "just show me my
   * favourites", which is the point of having favourites at all.
   */
  expandedModules: readonly string[]
  onToggleModule: (moduleKey: string) => void
  /** The screen currently open, as a favourite key. Drives active styling. */
  activeKey?: string
  /**
   * WHICH COPY of the open screen carries the indicator — `"favorites"`, or a
   * module key.
   *
   * A starred screen appears twice, and only ONE of them is selected: the row
   * the user actually clicked. Two accents for one open screen read as two
   * selections, which is the confusion this exists to remove.
   *
   * Undefined — a reload, a deep link, a link from inside a page — means no
   * path was taken, so the indicator falls back to the module. That is where
   * the screen LIVES, and it is the answer that never depends on history.
   */
  activeSection?: string
  /** A row was clicked, from `"favorites"` or from a module key. */
  onNavigate?: (section: string, key: string) => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
  linkComponent?: NavLinkComponent<Href>
  /** Whether the Favourites section is open. Persisted by the caller. */
  favoritesOpen?: boolean
  onToggleFavoritesOpen?: () => void
  /** Why the last change to the favourites or the open sections was not saved, under Favourites. */
  problem?: string | null
}

function NavTree<Href extends string = string>({
  modules,
  favorites,
  onToggleFavorite,
  expandedModules,
  onToggleModule,
  activeKey,
  activeSection,
  onNavigate,
  collapsed = false,
  onToggleCollapsed,
  linkComponent,
  favoritesOpen = true,
  onToggleFavoritesOpen,
  problem,
  className,
  ...props
}: NavTreeProps<Href> & Omit<React.ComponentProps<"nav">, "children">) {
  const headingId = useId()
  const Link = (linkComponent ?? DefaultNavLink) as NavLinkComponent<Href>

  // Resolve stored keys to live screens. A key naming a screen that no longer
  // exists is DROPPED rather than rendered dead — a converted-away screen must
  // not leave a broken entry the user cannot remove. Order follows the stored
  // list, which is the order the user built.
  const byKey = new Map<string, { module: NavTreeModule<Href>; item: NavItem<Href> }>()
  for (const module of modules) {
    for (const item of module.items) {
      byKey.set(favoriteKey(module.key, item.key), { module, item })
    }
  }
  const favoriteEntries = favorites
    .map((key) => {
      const hit = byKey.get(key)
      return hit ? { key, ...hit } : null
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  // Favourites only owns the indicator while the open screen is actually IN
  // it. Unstar the screen you are sitting on and the accent moves to its
  // module rather than vanishing with the row it was attached to.
  const inFavorites = favoriteEntries.some((entry) => entry.key === activeKey)
  const favoritesOwnsActive = activeSection === "favorites" && inFavorites

  // The rail is a named navigation landmark; the name is for screen readers only, so
  // the top row of the rail stays navigation.
  return (
    <nav
      aria-labelledby={headingId}
      data-slot="nav-tree"
      data-collapsed={collapsed}
      className={cn(
        "flex shrink-0 flex-col scroll-region overflow-x-hidden border-r-frame border-border bg-sidebar px-2 py-2 transition-[width] duration-(--motion-state) ease-(--motion-easing)",
        collapsed ? "w-14" : "w-[188px]",
        className,
      )}
      {...props}
    >
      <h2 id={headingId} className="sr-only">
        Navigation
      </h2>
      {/* FAVOURITES — always rendered, even when empty. A section that appears
          only once you have favourites cannot teach you that favourites exist;
          the empty copy is what points at the star.

          It carries a star icon so it survives collapse: favourites are the
          screens you reach most, and they would otherwise be the one thing
          unreachable from a 56px rail. */}
      <Section
        label="Favorites"
        icon={Star}
        open={favoritesOpen}
        collapsed={collapsed}
        active={favoritesOwnsActive}
        onToggle={onToggleFavoritesOpen}
      >
        {favoriteEntries.length === 0 ? (
          <EmptyNote>Star a screen to pin it here.</EmptyNote>
        ) : (
          favoriteEntries.map(({ key, item }) => (
            <Row
              key={key}
              item={item}
              favoriteKey={key}
              Link={Link}
              active={key === activeKey && favoritesOwnsActive}
              starred
              onToggleFavorite={onToggleFavorite}
              onNavigate={() => onNavigate?.("favorites", key)}
            />
          ))
        )}
      </Section>
      {problem ? (
        <p role="alert" className={cn("px-2 py-1 type-body text-feedback-danger", collapsed && "sr-only")}>
          {problem}
        </p>
      ) : null}

      {modules.map((module) => (
        <Section
          key={module.key}
          label={module.label}
          icon={module.icon}
          open={expandedModules.includes(module.key)}
          collapsed={collapsed}
          active={(activeKey?.startsWith(`${module.key}/`) ?? false) && !favoritesOwnsActive}
          onToggle={() => onToggleModule(module.key)}
        >
          {module.items.length === 0 ? (
            <EmptyNote>No screens yet</EmptyNote>
          ) : (
            module.items.map((item, index) => {
              const key = favoriteKey(module.key, item.key)
              // A subheading appears when this item's group differs from the
              // previous item's, so a module that sets no groups renders as a
              // flat list. Rendered in the flyout too — a collapsed rail must
              // not flatten a module into ten undifferentiated screens.
              const startsGroup =
                item.group !== undefined && item.group !== module.items[index - 1]?.group
              return (
                <Fragment key={item.key}>
                  {startsGroup ? <GroupHeading>{item.group}</GroupHeading> : null}
                  <Row
                    item={item}
                    favoriteKey={key}
                    Link={Link}
                    active={key === activeKey && !favoritesOwnsActive}
                    starred={favorites.includes(key)}
                    onToggleFavorite={onToggleFavorite}
                    onNavigate={() => onNavigate?.(module.key, key)}
                  />
                </Fragment>
              )
            })
          )}
        </Section>
      ))}

      {/* Bottom of the rail, after the modules — the control acts on the rail
          itself rather than naming a destination, so it does not belong in the
          run of destinations. */}
      {onToggleCollapsed ? (
        <CollapseControl collapsed={collapsed} onToggle={onToggleCollapsed} />
      ) : null}
    </nav>
  )
}

/**
 * The subheading inside a module.
 *
 * The rail is an OUTLINE — module, subheading, screen — so this level sits
 * BETWEEN its parent and its children and must read that way: a step down from
 * the module, a step up from the rows it introduces.
 *
 * It is therefore full-brightness text, one size below the module and one
 * weight below it, with its items stepped in beneath it. It is NOT muted and
 * NOT the smallest thing on screen: greyed and shrunk it reads as a disabled
 * row filed below the items it is supposed to introduce — the exact inversion
 * of its rank.
 *
 * Air above and none below binds it to the run beneath. Deliberately not used:
 * an underline or bottom border (on the web that reads as a link, and looking
 * clickable is this heading's standing risk), and `uppercase` (`design.md` →
 * Casing).
 */
function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <p
      className={cn(
        "mt-4 mb-1 pr-2 type-nav-group text-sidebar-foreground first:mt-1",
        LABEL_INDENT,
      )}
    >
      {children}
    </p>
  )
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className={cn("py-1 pr-2 type-hint text-muted-foreground", ITEM_INDENT)}>
      {children}
    </p>
  )
}

/**
 * Collapse / expand the rail.
 *
 * Distinct icon AND wording per state rather than one glyph that rotates: the
 * control is at rest in both states, so it has to say which way it will go
 * without the user working it out from an arrow's direction.
 */
function CollapseControl({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const Icon = collapsed ? ArrowRightToLine : ArrowLeftToLine
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar"
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!collapsed}
      aria-label={label}
      title={label}
      className={cn(
        "mt-auto flex items-center gap-2 rounded-control type-nav-item text-muted-foreground transition-colors hover:bg-muted hover:text-sidebar-foreground",
        collapsed ? "mx-auto size-8 justify-center px-0" : "h-7 px-2",
      )}
    >
      <Icon aria-hidden className="size-4 shrink-0" />
      <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
    </button>
  )
}

/**
 * A module (or Favourites) and the rows beneath it.
 *
 * Expanded, it is a disclosure — a real `<button>` with `aria-expanded`, so the
 * open/closed state is announced and keyboard-operable with no extra wiring.
 *
 * Collapsed, it becomes a FLYOUT trigger. The rows do not shrink to icons: a
 * collapsed rail whose screens are unreachable costs a click instead of saving
 * one, which is the state this replaced. The flyout renders the same rows the
 * expanded rail does — text labels, group headings, active indicator — so the
 * two states differ in where the list appears, never in what it contains.
 *
 * Opening a flyout NEVER expands the rail. The rail's width is changed by one
 * control and nothing else.
 */
function Section({
  label,
  icon: Icon,
  open,
  collapsed,
  active = false,
  onToggle,
  children,
}: {
  label: string
  icon?: NavItem["icon"]
  open: boolean
  collapsed: boolean
  /** This section holds the screen currently open. Used when collapsed. */
  active?: boolean
  onToggle?: () => void
  children: React.ReactNode
}) {
  if (collapsed) {
    return (
      <Flyout label={label} icon={Icon} active={active}>
        {children}
      </Flyout>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Icon and label lead; the chevron is right-aligned at the end of the
          row. A chevron sitting immediately left of the module icon competes
          with it — two marks in the same glance, one of them a control — and it
          pushes every label in the rail 20px right for the privilege. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        title={label}
        className="flex h-8 w-full items-center gap-2 rounded-control px-2 text-sidebar-foreground transition-colors hover:bg-muted"
      >
        {Icon ? <Icon aria-hidden className="size-4 shrink-0" /> : null}
        <span className="flex-1 truncate text-left type-nav-section">{label}</span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-(--motion-state)",
            open ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>
      {open ? <div className="flex flex-col gap-px pb-1">{children}</div> : null}
    </div>
  )
}

/** How long the pointer must rest before a flyout opens, and linger before it
 *  closes. The open delay stops a flyout firing at every icon the pointer
 *  crosses on its way somewhere else; the close delay is what lets the pointer
 *  travel the gap from the rail to the panel without it vanishing. */
const HOVER_OPEN_MS = 120
const HOVER_CLOSE_MS = 180

/**
 * A module's screens, in a panel beside the collapsed rail.
 *
 * Radix Popover rather than hand-rolled positioning, and specifically because
 * it PORTALS: the rail is a `scroll-region` column, so a panel rendered
 * inside it would be clipped at the rail's edge.
 *
 * Hover AND click both open it. Hover alone strands keyboard users; click alone
 * makes a pointer user work harder than the expanded rail would. A hover-opened
 * panel does not steal focus — a flyout appearing under the pointer must not
 * move the caret — while a click-opened one does, because that IS the keyboard
 * path into it.
 */
function Flyout({
  label,
  icon: Icon,
  active,
  children,
}: {
  label: string
  icon?: NavItem["icon"]
  /** This module holds the screen currently open. */
  active: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const byHover = useRef(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const clear = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }
  // The timer outlives a fast unmount (navigating away while a flyout is
  // opening), so it is cleared on teardown rather than left to fire into a
  // dead component. The cleanup touches only the ref, which is stable, so it
  // genuinely has no dependencies.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const openLater = () => {
    clear()
    timer.current = setTimeout(() => {
      byHover.current = true
      setOpen(true)
    }, HOVER_OPEN_MS)
  }
  const closeLater = () => {
    clear()
    timer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_MS)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        clear()
        byHover.current = false
        setOpen(next)
      }}
    >
      <PopoverTrigger
        aria-label={label}
        title={label}
        onPointerEnter={openLater}
        onPointerLeave={closeLater}
        className={cn(
          "relative mx-auto flex size-8 items-center justify-center rounded-control text-sidebar-foreground transition-colors hover:bg-muted data-[state=open]:bg-muted",
          active && "text-sidebar-primary",
        )}
      >
        {/* Collapsed, the rail must still answer "where am I" — the same 3px
            accent the expanded rail uses, on the module holding the open
            screen. Without it a 56px rail is orientation-free. */}
        {active ? (
          <span
            aria-hidden
            className="pointer-events-none absolute -left-1.5 top-1 bottom-1 w-[3px] rounded-pill bg-sidebar-primary"
          />
        ) : null}
        {Icon ? (
          <Icon aria-hidden className="size-4 shrink-0" />
        ) : (
          <span aria-hidden className="type-nav-section">
            {label.slice(0, 1)}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        ref={contentRef}
        side="right"
        align="start"
        sideOffset={8}
        onPointerEnter={clear}
        onPointerLeave={closeLater}
        onOpenAutoFocus={(event) => {
          // A hover-opened panel must not move the caret — the pointer is
          // already where the user is looking.
          if (byHover.current) {
            event.preventDefault()
            return
          }
          // Opened from the keyboard: land on the first DESTINATION. Left to
          // itself the first focusable is the leading row's star button, which
          // puts a keyboard user on "add to favourites" when they asked for the
          // list of screens.
          const first = contentRef.current?.querySelector("a")
          if (first) {
            event.preventDefault()
            first.focus()
          }
        }}
        inset="list"
        className="w-56"
      >
        {/* The module's name, because a panel floating beside an icon rail
            otherwise arrives with nothing saying what it belongs to. */}
        <p className="px-2 pt-1 pb-1 type-nav-section text-sidebar-foreground">
          {label}
        </p>
        <div className="flex flex-col gap-px">{children}</div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * One screen — a text row.
 *
 * The star sits INSIDE the row but OUTSIDE the link: nesting a button in an
 * anchor is invalid HTML and makes the star's click ambiguous. It is revealed on
 * hover/focus and stays visible once starred, which is the convention every
 * researched system converged on (Figma, Linear, Mem, ServiceNow) — a star on
 * every resting row is noise, but an invisible way to UNstar is a trap.
 */
function Row<Href extends string>({
  item,
  favoriteKey: key,
  Link,
  active,
  starred,
  onToggleFavorite,
  onNavigate,
}: {
  item: NavItem<Href>
  favoriteKey: string
  Link: NavLinkComponent<Href>
  active: boolean
  starred: boolean
  onToggleFavorite: (key: string) => void
  /** Records WHICH copy of this screen was clicked — see `activeSection`. */
  onNavigate?: () => void
}) {
  const { label, href } = item
  return (
    <div className="group/row relative flex items-center">
      {/* Accent bar. Saturation in a 3px strip instead of across the whole row:
          a starred screen appears TWICE (Favourites and its module) and both
          copies indicate, so a solid fill would spend most of the rail's visual
          weight saying one thing. It sits inside the link's left padding, so
          active and inactive rows have identical geometry — no text shift. */}
      {active ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-1 bottom-1 w-[3px] rounded-pill bg-sidebar-primary"
        />
      ) : null}
      <Link
        href={href}
        title={label}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-7 min-w-0 flex-1 items-center rounded-control pr-nav-item-affix-inset type-nav-item whitespace-nowrap text-sidebar-foreground transition-colors hover:bg-muted",
          ITEM_INDENT,
          // No fill. The bar plus the weight is the whole indicator — a
          // background on top of both is redundant, and it reads heavier than a
          // nav item should when the same screen indicates in two sections.
          active && "font-strong",
        )}
      >
        {/* `title` so a label that still truncates is readable on hover — the
            rail is narrow by design and truncation is the fallback, not the
            plan. */}
        <span className="truncate" title={label}>
          {label}
        </span>
      </Link>

      <IconButton
        label={starred ? `Unstar ${label}` : `Star ${label}`}
        icon={<Star aria-hidden className={cn("size-3.5", starred && "fill-current")} />}
        variant="row-toggle"
        size="icon-affix"
        aria-pressed={starred}
        onClick={() => onToggleFavorite(key)}
        className="absolute right-1"
      />
    </div>
  )
}

export { NavTree }
