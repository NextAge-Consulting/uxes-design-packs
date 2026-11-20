// ui-status: approved
// ui-block: BrowseToolbar
// ui-behaviour: browse-filtering.md, loading-states.md
import { type ComponentType, type ReactNode, useEffect, useState } from "react"
import { BusySlot, BusyStatus } from "@design-pack/ui/components/busy-status"
import { Badge } from "@design-pack/ui/components/ui/badge"
import { Button } from "@design-pack/ui/components/ui/button"
import { SearchInput } from "@design-pack/ui/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@design-pack/ui/components/ui/popover"
import { Search, SlidersHorizontal } from "lucide-react"

/**
 * The toolbar for every browse: title · search · Search · Filters · status.
 * Pattern and rationale:
 * `.claude/skills/ui-patterns/references/browse-filtering.md`.
 *
 * Only search sits on the bar. Every other facet goes inside the Filters
 * popover, which carries a count badge — a flat row of every control does not
 * survive a browse with more than three facets, and costs vertical space better
 * spent on rows.
 *
 * NO primary button. A browse's primary action is opening a row, which has no
 * button; "one primary per view" is a ceiling, not a quota. When a create
 * action exists it takes the primary slot, via `actions`.
 *
 * `title` is left out where something above already names the list (a card's
 * title). `search="live"` filters as the person types, for a list already
 * loaded; `submit` (the default) searches on Search, Enter or leaving the field, for
 * one the server pages — once per change of term: the term already applied is never
 * searched again. The × in the box clears the search at once. `searching` shows the
 * list loading — a search, a page or a sort — as a spinner and "Loading" after Filters
 * (`loading-states.md`). `icon` is the screen's own icon, beside the title.
 */
export function BrowseToolbar({
  title,
  icon: Icon,
  searchLabel,
  search = "submit",
  searchPlaceholder,
  searchTerm,
  onSearch,
  searching = false,
  filterCount,
  filters,
  onFilter,
  actions,
  status,
}: {
  title?: string
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  /** The search field's accessible name; defaults to "Search <title>". */
  searchLabel?: string
  search?: "submit" | "live"
  searchPlaceholder: string
  /** The applied term, from the URL. The field re-syncs when it changes. */
  searchTerm: string
  onSearch: (term: string | undefined) => void
  /** The list's rows or count are on their way — `useBrowseData`'s `loading`. */
  searching?: boolean
  /** Active facets, badged on the Filters button. Search is deliberately NOT
   *  counted — it is visible in the field and needs no second indicator. */
  filterCount: number
  /** Facet controls for the popover. Omit to hide the Filters button entirely. */
  filters?: ReactNode
  /** Opens the list's advanced filter, in place of the popover. */
  onFilter?: () => void
  /** Create and other screen actions. The create action is the one `default`
   *  (primary) button a browse may have. */
  actions?: ReactNode
  /** Right-aligned state — data source, sync health. */
  status?: ReactNode
}) {
  const [term, setTerm] = useState(searchTerm)
  useEffect(() => {
    setTerm(searchTerm)
  }, [searchTerm])
  // The applied term is already the list; searching it again only repeats the request.
  const submit = () => {
    const next = term.trim() || undefined
    // searchTerm is a required string prop, so it always has .trim(): no undefined guard.
    if (next !== (searchTerm.trim() || undefined)) onSearch(next)
  }

  return (
    <div data-browse-head className="flex flex-wrap items-center gap-3">
      {/* Same icon the nav row carries — see PageHeading. Sized to the compact
          toolbar heading rather than the block heading, because this title
          shares its row with search and filters. */}
      {title ? (
      <div className="flex items-center gap-2">
        {Icon ? (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-control border-frame border-border bg-card text-muted-foreground">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
        <h1 className="type-browse-title">{title}</h1>
      </div>
      ) : null}

      <form
        className="flex flex-1 items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <SearchInput
          className="min-w-56 max-w-md flex-1"
          aria-label={searchLabel ?? `Search ${(title ?? "").toLowerCase()}`}
          value={term}
          onChange={(e) => {
            setTerm(e.target.value)
            if (search === "live") onSearch(e.target.value || undefined)
          }}
          onBlur={search === "submit" ? submit : undefined}
          onClear={() => {
            setTerm("")
            if (searchTerm) onSearch(undefined)
          }}
          placeholder={searchPlaceholder}
        />
        {search === "submit" ? (
          <Button type="submit" variant="outline">
            <Search aria-hidden className="size-4" />
            Search
          </Button>
        ) : null}

        {onFilter ? (
          <Button type="button" variant="outline" onClick={onFilter}>
            <SlidersHorizontal aria-hidden className="size-4" />
            Filters
            {filterCount > 0 ? (
              <Badge variant="data" className="ml-1">
                {filterCount}
              </Badge>
            ) : null}
          </Button>
        ) : filters ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" aria-label="Filters">
                <SlidersHorizontal aria-hidden className="size-4" />
                Filters
                {filterCount > 0 ? (
                  <Badge variant="data" className="ml-1">
                    {filterCount}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            {/* Panel treatment matches DetailPanel: a primary-muted header band
                over a bordered card. */}
            <PopoverContent align="start" inset="flush" className="w-80">
              <div className="border-b-frame border-border-subtle bg-primary-muted px-4 py-2">
                <h3 className="type-section-heading">Filters</h3>
              </div>
              <div className="flex flex-col gap-4 p-4">{filters}</div>
            </PopoverContent>
          </Popover>
        ) : null}

        {/* The list is loading its next rows — a search, a page or a sort alike — so the
            sign sits after the controls rather than on any one of them. */}
        <BrowseLoading busy={!!searching} />
      </form>

      {actions}
      {status}
    </div>
  )
}

/**
 * A list's loading sign — a spinner and "Loading", announced — where the list's controls
 * end: after Filters on a browse's toolbar, before a child list's own actions
 * (`loading-states.md`). Its slot is always there, so nothing beside it moves.
 */
export function BrowseLoading({ busy }: { busy: boolean }) {
  return (
    <>
      <span className="flex items-center gap-2 type-state-message text-muted-foreground">
        <BusySlot busy={busy} idle={null} />
        {busy ? "Loading" : null}
      </span>
      <BusyStatus busy={busy}>Loading</BusyStatus>
    </>
  )
}
