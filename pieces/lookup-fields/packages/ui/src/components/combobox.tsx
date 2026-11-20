// ui-status: approved
// ui-atom
// ui-behaviour: lookup-fields.md
"use client"

import * as React from "react"
import { Command as CommandPrimitive, defaultFilter } from "cmdk"
import { ChevronDown, X } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@design-pack/ui/components/ui/command"
import { fieldVariants } from "@design-pack/ui/components/ui/input"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@design-pack/ui/components/ui/popover"
import { Spinner } from "@design-pack/ui/components/ui/spinner"
import { cn } from "@design-pack/ui/lib/utils"
import { IconButton } from "@design-pack/ui/components/icon-button"

export interface ComboboxOption {
  value: string
  label: string
  /** A second line under the label — an account type, a vendor's city. */
  description?: string
  /** A short marker after the label, e.g. "Inactive". */
  badge?: string
  disabled?: boolean
}

/**
 * A text input with a list that filters as you type.
 *
 * ## Combobox vs Select — the words mean different controls
 *
 * A **Select** is a closed dropdown: click, pick, no typing. A **Combobox** is
 * this — a text input plus a filtered list. That is the W3C ARIA naming
 * (`role="combobox"` requires a text input), which Radix and shadcn follow, and
 * it is the vocabulary this project uses in code, comments and docs. Several
 * desktop toolkits call the first one a "combo box"; that name does not come
 * across.
 *
 * **Use a Select at 15 rows or fewer.** Below that threshold a filter box is
 * friction rather than help — NN/g puts the boundary at ~15, and USWDS (7),
 * Material (6) and Carbon (3) agree on the lower end. A combobox on a five-row
 * list makes the user type to reach something they could already see.
 *
 * ## The input IS the combobox — there is no popup window
 *
 * cmdk's input carries the full editable-combobox contract: `role="combobox"`,
 * `aria-expanded`, `aria-controls`, and `aria-activedescendant` tracking the
 * highlighted row, with the APG key bindings (arrows, Home/End, Enter) already
 * wired. The list hangs under the input in a popover that never takes focus,
 * so Escape closes the list and leaves the caret where it was.
 *
 *
 * ## Presentational only
 *
 * No query, no server function, no permission check. A bound field in the app
 * is the data-aware half — putting a query in here would break the Claude
 * Design feed and fail `node scripts/check-workspace-tiers.mjs`.
 */
export function Combobox({
  onInputId,
  label,
  value,
  onValueChange,
  options,
  placeholder = "Search…",
  emptyMessage = "No matches.",
  loadingMessage = "Searching…",
  isLoading = false,
  isError = false,
  errorMessage = "Couldn't load the choices, so none can be shown.",
  filter = "client",
  create,
  onSearchChange,
  footer,
  trailing,
  clearable = true,
  disabled = false,
  invalid = false,
  describedBy,
  className,
  ...props
}: {
  /**
   * Called with the input's real id — cmdk generates it and will not accept
   * one. A caller rendering its own `<label htmlFor>` needs this; see the
   * effect below for why the id is not simply overwritten.
   */
  onInputId?: (id: string) => void
  /** The value was refused: the shell draws its invalid look and the input says so to assistive tech. */
  invalid?: boolean
  /** The ids of the hint and error that describe the field. */
  describedBy?: string
  /**
   * The field's label text.
   *
   * Rendered into a visually-hidden `Command.Label`, which is NOT decoration —
   * see the note where it is rendered. Without it cmdk steals focus out of the
   * input on the first keystroke.
   */
  label?: string
  /** The selected option's value, or `''`. */
  value: string
  onValueChange: (value: string) => void
  /**
   * Every option the list should show RIGHT NOW.
   *
   * With `filter="client"` this is the whole set and cmdk narrows it. With
   * `filter="none"` it is already the server's answer for the current query,
   * and narrowing it again would hide rows the server deliberately returned.
   */
  options: readonly ComboboxOption[]
  placeholder?: string
  emptyMessage?: string
  loadingMessage?: string
  isLoading?: boolean
  /** The list could not be loaded. Distinct from "no matches" — an empty list
   *  and an unreachable source look identical otherwise, and one of those is a
   *  data problem the user should not have to guess at (constitution §X). */
  isError?: boolean
  errorMessage?: string
  /**
   * `client` — the whole set is in `options`; cmdk filters it, so a multi-field
   * match (a number OR a name) is free.
   * `none` — the caller is searching a remote source and `options` is already
   * the answer.
   */
  filter?: "client" | "none"
  /**
   * The create affordance, as a ROW IN THE LIST labelled with what was typed —
   * `Add "Acme Supply Co"`. Never a separate `+` button beside the field.
   *
   * It appears only when the query matches NOTHING, which is what keeps it a
   * value rather than a command in a listbox (the ARIA guidance is explicit
   * about that), and it removes a decision: the user no longer has to work out
   * whether the thing exists, because the system just answered that by finding
   * nothing.
   *
   * Omit it entirely for a user without the create permission — a control they
   * cannot use should not be on screen.
   */
  create?: {
    /** `(query) => 'Add "Acme Supply Co"'`. */
    label: (query: string) => string
    onSelect: (query: string) => void
  }
  /** Called on every keystroke, so a remote source can debounce and search. */
  onSearchChange?: (query: string) => void
  /**
   * A control pinned to the bottom of the panel — an `OptionSwitch` scoping the list, a count.
   *
   * It belongs inside the panel because that is where the user is when they
   * discover the option they want is missing. A link beside the field means
   * closing the list, clicking, and reopening; and anything one-way there is
   * worse still, because there is then no way back to the narrower view.
   */
  footer?: React.ReactNode
  /**
   * An action on the value ALREADY SELECTED — "open the full record".
   *
   * In the field, not the panel footer: the footer is for controls that change
   * what the LIST shows, and this one does nothing to the list. Rendered ahead
   * of the clear button so the disclosure caret stays last, where a disclosure
   * belongs.
   *
   * Keep it to an icon. The field is a text input first, and a worded button
   * beside it reads as the field's primary action when it is a secondary one.
   */
  trailing?: React.ReactNode
  clearable?: boolean
  disabled?: boolean
  className?: string
} & Omit<React.ComponentProps<"div">, "onSelect" | "value" | "defaultValue">) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [fieldWidth, setFieldWidth] = React.useState<number>()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const fieldRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)

  // The panel matches the FIELD, measured.
  //
  // Radix publishes `--radix-popover-trigger-width` only when the popover has a
  // `Trigger`. This one has an `Anchor` — the field is not a button — so that
  // variable is never set and `PopoverContent`'s stock `w-72` wins, giving a
  // 288px dropdown under a full-width field. Measuring is the only way to keep
  // them in step, and it has to follow resizes: the field is in a responsive
  // grid, so its width changes without the popover reopening.
  React.useEffect(() => {
    const field = fieldRef.current
    if (!field) return
    const measure = () => setFieldWidth(field.getBoundingClientRect().width)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(field)
    return () => observer.disconnect()
  }, [])

  // ---- Two attributes cmdk sets AFTER spreading the caller's props ---------
  //
  // `t.createElement(D.input, { ...u, role: "combobox", "aria-expanded": !0,
  // id: inputId, "aria-labelledby": labelId, … })` in `dist/index.mjs` — the
  // spread comes first, so nothing passed as a prop can win.
  //
  //   aria-expanded  hard-coded true, because in a command PALETTE the list is
  //                  always on screen. Here it is a popover, and a control that
  //                  permanently announces itself as open sends a screen-reader
  //                  user looking for a list that is not there.
  //
  //   id             cmdk's own. **It is left alone**, and the visible label is
  //                  pointed at it instead — the reverse of the obvious fix,
  //                  for a reason worth knowing:
  //
  //                  on every highlight change cmdk runs
  //                  `getElementById(cmdkInputId)?.focus() ?? listEl.focus()`,
  //                  meaning "put focus back on the input". Renaming the input
  //                  makes that lookup fail, so it falls through to focusing
  //                  the LIST — which carries `tabindex="-1"`. The first
  //                  keystroke then moves focus out of the field and every
  //                  keystroke after it goes nowhere until the user clicks back
  //                  in. Leaving the id alone makes cmdk's call find the input
  //                  that already has focus, which is the no-op it is meant to
  //                  be.
  //
  // `aria-labelledby` needs no correction: `label` below renders cmdk's hidden
  // label carrying the same text, so it resolves to the right name.
  React.useEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.setAttribute("aria-expanded", String(open))
    if (!label) input.removeAttribute("aria-labelledby")
    // The input is cmdk's, so its attributes are set here rather than passed.
    if (invalid) input.setAttribute("aria-invalid", "true")
    else input.removeAttribute("aria-invalid")
    if (describedBy) input.setAttribute("aria-describedby", describedBy)
    else input.removeAttribute("aria-describedby")
  }, [open, label, invalid, describedBy])

  // The visible label follows the input, since the input's id is not ours to
  // set. Reported upward so the caller's `<label htmlFor>` resolves and
  // clicking it still focuses the field.
  React.useEffect(() => {
    if (inputRef.current) onInputId?.(inputRef.current.id)
  }, [onInputId])

  const selected = options.find((o) => o.value === value)

  // Closed, the field reads as the chosen value. Open, the input is EMPTY and
  // the chosen value moves to the placeholder.
  //
  // It cannot stay in the value: cmdk's input is controlled, and whatever is in
  // it IS the search string — so leaving the label there would filter the list
  // down to the one row already selected. Blanking it outright is what made the
  // field look like it had lost your data the moment you clicked it; as a
  // placeholder it is still legible, still says what is set, and the list opens
  // unfiltered.
  //
  // The `query !== ""` half of the test is load-bearing, not belt-and-braces:
  // keying it on `open` alone drops any character that arrives before React has
  // processed the focus that opens the popover. The user types, the first letter
  // vanishes, and it looks like a dropped keystroke rather than a state bug.
  const searching = open || query !== ""
  const shown = searching ? query : (selected?.label ?? "")
  const shownPlaceholder = searching && selected ? selected.label : placeholder

  const setSearch = (next: string) => {
    setQuery(next)
    onSearchChange?.(next)
  }

  const commit = (option: ComboboxOption) => {
    onValueChange(option.value)
    setSearch("")
    setOpen(false)
  }

  const trimmed = query.trim()

  // ---- Contains first, fuzzy only if contains found NOTHING ---------------
  //
  // Measured over real lists of names and descriptions, the two matchers fail in
  // opposite directions:
  //
  //   contains  never surprises, and rescues no typo at all — `fastner`,
  //             `prcision` and `cogs` each return
  //             ZERO rows.
  //   fuzzy     rescues every one of those, and over-admits badly on a short or
  //             common query — three digits return ten times the rows meant, and
  //             a misspelt common word more still. Correctly RANKED, but the list
  //             stops visibly narrowing as you type, which is most of what
  //             typing is for.
  //
  // Escalating gets both: the strict pass answers whenever it can, and the
  // forgiving one only runs when the alternative is an empty list. Every case
  // above comes out right.
  //
  // Silently. A "showing close matches" banner is a search-RESULTS-page idiom
  // (Google's "Showing results for…"); no autocomplete on the web announces it,
  // and the per-character highlight on those rows is what explains them.
  const anyContains =
    filter !== "client" ||
    trimmed === "" ||
    options.some((option) => matchTarget(option).toLowerCase().includes(trimmed.toLowerCase()))

  const highlight = anyContains ? "substring" : "subsequence"

  // Memoised so the identity is stable per mode — cmdk re-runs the whole filter
  // when this prop changes.
  const activeFilter = React.useMemo(
    () => (anyContains ? containsFilter : fuzzyFilter),
    [anyContains],
  )

  // How many rows will ACTUALLY be on screen — scored with the same function
  // cmdk is about to use.
  //
  // Not `options.length`: that is the array handed TO cmdk, which for a cached
  // list is every row it holds. Gating the create row on it meant the row could
  // never appear for a cached source, and on a field with an explicit "(none)"
  // option it could never appear at all, because that synthetic row alone kept
  // the count at one.
  const matchCount =
    filter !== "client" || trimmed === ""
      ? options.length
      : options.filter((option) => activeFilter(matchTarget(option), trimmed) > 0).length

  // The create row appears ONLY when nothing matched, and only once the list has
  // settled — offering to create something because a list that is still loading
  // found nothing is the same lie with an action attached.
  const showCreate =
    Boolean(create) && trimmed !== "" && !isLoading && !isError && matchCount === 0

  return (
    <Command
      // `false` when the caller is searching remotely: those rows ARE the
      // answer, and filtering them again drops matches the server chose to
      // return (a description match the remote query cannot express, for one).
      shouldFilter={filter === "client"}
      // Plain SUBSTRING matching, replacing cmdk's default scorer.
      //
      // That default is a fuzzy subsequence match: it accepts the typed
      // characters in order but NOT adjacent, anywhere in the string. So `1200`
      // matches `1502-2-Equipment:2020 Truck` by taking the
      // 1, then a 2, then two 0s from three different parts of the label — and
      // it scores that above the exact `1200-Inventory Asset`. Words survive it;
      // numbers do not, and an account number is what an accountant types.
      //
      // The score is BINARY on purpose. cmdk orders by score, and ties keep
      // insertion order, so 1/0 is what lets the caller's own sort (accounts by
      // number) actually reach the screen instead of being re-ranked.
      filter={activeFilter}
      // NOT decoration, and not optional — this renders cmdk's hidden label,
      // and without it the field stops accepting keystrokes.
      //
      // Every time the highlighted row changes, cmdk does this
      // (`dist/index.mjs`, `setState` for `value`):
      //
      //   if (activeElement has cmdk-input or cmdk-root)
      //     getElementById(labelId)?.focus() ?? getElementById(listId).focus()
      //
      // The label is a `<label>` and therefore NOT focusable, so in a command
      // palette that call is a deliberate no-op and focus stays in the input.
      // With no label it falls through to focusing the LIST, which IS
      // focusable — so the FIRST keystroke moves focus out of the field and
      // every keystroke after it goes nowhere until the user clicks back in.
      //
      // It also gives cmdk's `aria-labelledby` a real target carrying the right
      // text, instead of a dangling id that wins over the visible label and
      // leaves the field with no accessible name at all.
      label={label}
      // The wrapper must not swallow arrow keys before cmdk sees them, and it
      // must not paint a second surface behind the input.
      className={cn("overflow-visible bg-transparent", className)}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div
            ref={fieldRef}
            data-slot="combobox"
            data-disabled={disabled || undefined}
            // No padding here, and no click handler here. The INPUT carries the
            // left padding so it physically covers the whole field, which makes
            // "click anywhere in the box to open it" true by geometry rather
            // than by a handler on a static element. The caret and the clear X
            // are real buttons and own their own hits.
            className={cn(
              fieldVariants({ part: "shell" }),
              "flex h-control items-center gap-1 pr-2"
            )}
          >
            <CommandInputBare
              ref={inputRef}
              value={shown}
              disabled={disabled}
              placeholder={shownPlaceholder}
              onValueChange={setSearch}
              // Select what is there, so typing replaces the current value
              // rather than appending to it.
              onFocus={(e) => {
                setOpen(true)
                e.currentTarget.select()
              }}
              onMouseDown={() => setOpen(true)}
              onBlur={(event) => {
                // Focus moving INTO the panel is not leaving the field. Without
                // this guard, pressing the mouse down on a row closes the list
                // before the click lands on it — which reads as "the dropdown
                // shuts the moment I move into it".
                if (panelRef.current?.contains(event.relatedTarget)) return
                // Leaving without picking abandons the half-typed query rather
                // than leaving the field reading as something it does not hold.
                setOpen(false)
                setSearch("")
              }}
            />

            {trailing}

            {clearable && value && !disabled ? (
              <IconButton
                label="Clear selection"
                icon={<X aria-hidden className="size-3.5" />}
                variant="quiet"
                size="icon-affix"
                // The button must not take focus from the input — that would
                // close the list on the way to clearing it.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onValueChange("")
                  setSearch("")
                  inputRef.current?.focus()
                }}
              />
            ) : null}

            {isLoading ? (
              <Spinner aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              // A real button, because it was a decorative icon: clicking it
              // did nothing on the way OPEN (no focus, so nothing opened) while
              // appearing to work on the way SHUT, since blurring the input
              // closes the list. One direction working is worse than neither.
              //
              // `tabIndex={-1}` — the input is the control and the only tab
              // stop; the caret is a pointer affordance for something the
              // keyboard already does with the arrow keys (APG combobox).
              <IconButton
                label={open ? "Close the list" : "Open the list"}
                icon={
                  <ChevronDown
                    aria-hidden
                    className={cn("transition-transform", open && "rotate-180")}
                  />
                }
                variant="quiet"
                size="icon-affix"
                tabIndex={-1}
                disabled={disabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setOpen(!open)
                  inputRef.current?.focus()
                }}
              />
            )}
          </div>
        </PopoverAnchor>

        <PopoverContent
          ref={panelRef}
          align="start"
          sideOffset={4}
          style={fieldWidth ? { width: fieldWidth } : undefined}
          // Focus stays in the input — that is the whole editable-combobox
          // contract. Radix would otherwise move it into the popover and the
          // next keystroke would go nowhere.
          onOpenAutoFocus={(e) => e.preventDefault()}
          // Pressing the mouse down inside the panel must not move focus at
          // all. Without this the input blurs on mousedown and the list closes
          // before the mouseup that would have selected a row — the panel
          // appears to shut the instant the pointer enters it. The click event
          // still fires, so rows and the footer stay operable.
          onMouseDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (inputRef.current?.contains(e.target as Node)) e.preventDefault()
          }}
          inset="flush"
        >
          <CommandList className="max-h-64">
            {isError ? (
              <StatusRow>{errorMessage}</StatusRow>
            ) : isLoading ? (
              // Never a blank popover. An empty panel while a request is in
              // flight reads as "there is nothing", which is a different and
              // wrong fact.
              <StatusRow>
                <Spinner aria-hidden className="size-4" />
                {loadingMessage}
              </StatusRow>
            ) : (
              <>
                {/* Rendered only when there is a message to render. Left
                    mounted with null children it still contributes its own
                    padding, which showed as an empty box above the create
                    row. */}
                {showCreate ? null : (
                  <CommandEmpty>
                    {emptyMessage}
                  </CommandEmpty>
                )}
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={
                      // What cmdk matches against. Both fields, so a search on
                      // an account NUMBER and one on its NAME both land — the
                      // multi-field OR that a remote source cannot do. The
                      // escalation test above must score the SAME string, or it
                      // would decide "nothing contains this" about a set cmdk
                      // then filters differently.
                      filter === "client" ? matchTarget(option) : option.value
                    }
                    disabled={option.disabled}
                    onSelect={() => commit(option)}
                    kind="detailed"
                  >
                    <span className="flex w-full items-center gap-2">
                      {/* The highlight is wrapped, not spread. `Matched`
                          returns three text runs, and dropped straight into
                          this flex row each one became a flex ITEM — so the
                          gap put 8px of air on both sides of every match.
                          `1250-Inventory` rendered as `1250- I nventory`. */}
                      <span className="min-w-0 truncate">
                        <Matched
                          text={option.label}
                          query={trimmed}
                          mode={highlight}
                        />
                      </span>
                      {option.badge ? (
                        <span className="ml-auto shrink-0 type-badge text-muted-foreground">
                          {option.badge}
                        </span>
                      ) : null}
                    </span>
                    {option.description ? (
                      <span className="type-metadata text-muted-foreground">
                        <Matched
                          text={option.description}
                          query={trimmed}
                          mode={highlight}
                        />
                      </span>
                    ) : null}
                  </CommandItem>
                ))}
                {showCreate && create ? (
                  <CommandItem
                    // `forceMount` because with `shouldFilter` on, cmdk scores
                    // this row against the query like any other and would hide
                    // the very row that exists BECAUSE nothing matched.
                    forceMount
                    value={`__create__${trimmed}`}
                    onSelect={() => {
                      create.onSelect(trimmed)
                      setSearch("")
                      setOpen(false)
                    }}
                    kind="action"
                  >
                    {create.label(trimmed)}
                  </CommandItem>
                ) : null}
              </>
            )}
          </CommandList>

          {/* The scope control lives HERE, not beside the field. Outside the
              panel it is a find-it / close / click / reopen sequence, and the
              user is looking at the list precisely when they discover the thing
              they want is not in it. Sticky, so it stays reachable while
              scrolling a long list. */}
          {footer ? (
            <div className="sticky bottom-0 border-t-frame border-border-subtle bg-popover p-1">
              {footer}
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </Command>
  )
}

/**
 * cmdk's input without shadcn's bordered wrapper and magnifier.
 *
 * The wrapper belongs to a command PALETTE, where the input is the top row of
 * a panel. Here the input is the field itself, so the border lives on the shell
 * around it and a search icon inside a form field is noise.
 */
const CommandInputBare = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof CommandPrimitive.Input>
>((props, ref) => (
  <CommandPrimitive.Input
    ref={ref}
    className="h-control w-full min-w-0 bg-transparent pl-3 type-form-control outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed"
    {...props}
  />
))
CommandInputBare.displayName = "CommandInputBare"

/**
 * The text a row is matched against — label plus description.
 *
 * One definition, used by cmdk's item `value` AND by the escalation test, so
 * the two cannot disagree about what "contains" means.
 */
function matchTarget(option: ComboboxOption): string {
  return `${option.label} ${option.description ?? ""}`
}

/** Case-insensitive substring match. 1 or 0 — see the note at the call site. */
function containsFilter(itemValue: string, search: string): number {
  const term = search.trim().toLowerCase()
  if (!term) return 1
  return itemValue.toLowerCase().includes(term) ? 1 : 0
}

/**
 * The floor below which cmdk's score is noise rather than a match.
 *
 * Its scorer is NOT a strict subsequence matcher — it awards partial credit for
 * some of the query's characters landing, so a score is almost never zero. Typing
 * `xxxx` scores 0.0099 against a name that contains one `x`, and a
 * list came back six rows deep in things that merely contain an x.
 *
 * Measured on real data, the two populations do not overlap:
 *
 *   real rescues    `cogs` 0.721 · `fastner` 0.151 · `acount` 0.151
 *                   `recievable` 0.090 · `inevntory` 0.089
 *   noise           `x` 0.170 (one char, so genuinely a match) …
 *                   `xxx` 0.017 · `xxxx` 0.0099
 *
 * 0.05 sits in the five-fold gap between the lowest real rescue and the highest
 * junk. Without a floor the fallback finds something for almost any input, which
 * means the create row — which appears only when NOTHING matched — could never
 * appear at all.
 */
const FUZZY_FLOOR = 0.05

/** cmdk's scorer with the noise cut off. */
export function fuzzyFilter(itemValue: string, search: string): number {
  const score = defaultFilter?.(itemValue, search, undefined) ?? 0
  return score >= FUZZY_FLOOR ? score : 0
}

/**
 * The tightest run of positions where `query`'s characters appear in `text`, in
 * order but not necessarily adjacent — the alignment a fuzzy match actually
 * used, so it can be shown to the user.
 *
 * **Tightest, not first.** A plain left-to-right greedy scan takes the earliest
 * character every time and produces highlights strewn across a long string —
 * `assy` lighting up the `a` of `Adapter`, an `s` twelve characters later and
 * so on. Trying every viable start and keeping the SMALLEST span (earliest on a
 * tie) is what makes the highlight land on the word the user was actually
 * reaching for. That is what fzf and VS Code's quick-open do, and the strings
 * here are short enough that the extra passes are free.
 *
 * `null` when the query is not a subsequence at all — the caller then renders
 * plain text rather than a trail of half-matched letters.
 */
export function subsequencePositions(text: string, query: string): number[] | null {
  const t = text.toLowerCase()
  const q = query.toLowerCase()
  if (!q) return null

  let best: number[] | null = null
  for (let start = 0; start <= t.length - q.length; start++) {
    if (t[start] !== q[0]) continue
    const positions = [start]
    let qi = 1
    for (let i = start + 1; i < t.length && qi < q.length; i++) {
      if (t[i] === q[qi]) {
        positions.push(i)
        qi++
      }
    }
    if (qi < q.length) break // no later start can finish either
    const span = positions[positions.length - 1] - positions[0]
    if (!best || span < best[best.length - 1] - best[0]) best = positions
  }
  return best
}

/**
 * Adjacent characters merged into runs, so the DOM holds a handful of spans
 * rather than one per letter.
 *
 * Each run carries `at`, its offset in the string — a real key, unique within
 * the row, where the array index would not be (the same run text can repeat).
 */
export function runsFrom(
  text: string,
  hits: readonly number[],
): { text: string; hit: boolean; at: number }[] {
  const hit = new Set(hits)
  const runs: { text: string; hit: boolean; at: number }[] = []
  for (let i = 0; i < text.length; i++) {
    const isHit = hit.has(i)
    const last = runs[runs.length - 1]
    if (last && last.hit === isHit) last.text += text[i]
    else runs.push({ text: text[i], hit: isHit, at: i })
  }
  return runs
}

function StatusRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      // The list is empty of options but not of meaning — announce the state
      // rather than letting a screen reader find nothing.
      role="status"
      className="flex items-center justify-center gap-2 px-3 py-6 type-state-message text-muted-foreground"
    >
      {children}
    </div>
  )
}

/**
 * The matched run: a fill plus weight, not weight alone.
 *
 * Weight alone works in light mode and all but disappears in dark. Light text
 * on a dark ground blooms, which compresses the perceptual step between regular
 * and bold — so the same markup that reads clearly on white is barely visible
 * on the dark panel. The `match` token carries it in both themes; the bold
 * stays because it is doing real work in light mode.
 *
 * No horizontal padding, deliberately: a fill with padding nudges every glyph
 * after it, so the row's text shifts as you type.
 */
const HIT = "rounded-stamp bg-match font-heading text-match-foreground"

/**
 * What matched, emphasised — in whichever way the row actually matched.
 *
 * `substring` is the ordinary case: one contiguous run, first occurrence only.
 * Highlighting every occurrence in a long name turns the row into stripes and
 * stops helping.
 *
 * `subsequence` is for a row that came back from the fuzzy fallback, where by
 * definition NO contiguous run exists. Without per-character emphasis those
 * rows render with nothing bolded at all, which reads as a rendering fault
 * rather than as a near-match — the user typed `fastner` and `ACME FASTENERS`
 * appears looking untouched, with no clue why. Showing the characters that
 * matched is what every fuzzy finder does, and it is the only thing on screen
 * that explains the row.
 */
function Matched({
  text,
  query,
  mode,
}: {
  text: string
  query: string
  mode: "substring" | "subsequence"
}) {
  if (!query) return <>{text}</>

  if (mode === "substring") {
    const at = text.toLowerCase().indexOf(query.toLowerCase())
    if (at < 0) return <>{text}</>
    return (
      <>
        {text.slice(0, at)}
        <mark className={HIT}>{text.slice(at, at + query.length)}</mark>
        {text.slice(at + query.length)}
      </>
    )
  }

  const positions = subsequencePositions(text, query)
  if (!positions) return <>{text}</>
  return (
    <>
      {runsFrom(text, positions).map((run) =>
        run.hit ? (
          <mark key={run.at} className={HIT}>
            {run.text}
          </mark>
        ) : (
          <span key={run.at}>{run.text}</span>
        ),
      )}
    </>
  )
}
