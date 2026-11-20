// ui-status: approved
// ui-block: RecordScreen
// ui-behaviour: loading-states.md, saving.md
// Guarantee: a form sits at the form width unless its content needs the full width; a wide table inside it scrolls in its own container.
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { RecordMark } from '@design-pack/ui/components/record-mark'
import { Card, CardContent } from '@design-pack/ui/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@design-pack/ui/components/ui/collapsible'
import { Skeleton } from '@design-pack/ui/components/ui/skeleton'
import { Alert } from '@design-pack/ui/components/ui/alert'
import { useDelayedLoading } from '@design-pack/ui/hooks/use-delayed-loading'
import type { NavIcon } from '@design-pack/ui/components/app-shell/nav-types'

import { PageHeading } from './PageHeading'

/**
 * The container every non-record form renders inside: the width frame, the
 * heading in whichever place the heading switch puts it, one bordered container
 * holding the sections, and the footer that owns the save.
 *
 * Pattern, switches and sources:
 * `.claude/skills/ui-patterns/references/form-layout.md`.
 *
 * ## Why the container is load-bearing
 *
 * Two or more regions floating directly on the page background, with a save
 * floating below them, says nothing about what the save covers. The container IS
 * the declaration of scope: everything inside it is what the footer writes. A form
 * with one region and a form with three are then the same object, which is why
 * a preferences form, an account form and a user form all render through this.
 *
 * ## Sections are divided, not nested
 *
 * Regions inside are {@link FormSection}s separated by a rule, NOT nested cards.
 * The theme is flat and carries structure on 2px borders (`design.md` →
 * Elevation & Depth), so a bordered panel inside a bordered container reads as
 * two competing frames. `DetailPanel`'s banded header belongs to record screens,
 * where a panel genuinely is its own object.
 */
export function FormShell({
  icon,
  title,
  description,
  heading = 'generic',
  badges,
  state,
  isPending = false,
  isError = false,
  errorMessage = "This couldn't be loaded. Reload the page to try again.",
  skeletonRows = 4,
  children,
  footer,
  onSubmit,
  banner,
  width = 'form',
}: {
  icon?: NavIcon
  title: string
  description?: string
  /**
   * `generic` — the title names the SCREEN, so it sits outside the container.
   * `identity` — the title is the object's own name, so it sits inside as the
   * `h1` with its status badges. A prompt screen — a page holding one prompt, its
   * choices and the action they feed, as a `PromptDialog` would — sets its title inside
   * the same way, built as that dialog is. Never both.
   */
  heading?: 'generic' | 'identity'
  /** Status badges beside an identity heading. Ignored for a generic one. */
  badges?: ReactNode
  /**
   * The record's own STATE control — the active/inactive switch — pinned to the
   * right of an identity heading.
   *
   * State is not a field. It is the one thing about a record you check before
   * reading anything else, and it belongs where the record identifies itself
   * rather than buried in whichever field group it happened to land in. Same
   * position on every record screen, so it is never hunted for.
   *
   * Rendered INSIDE the form element (see the note on FormBody), so a bound
   * control here behaves exactly as it would among the fields.
   */
  state?: ReactNode
  isPending?: boolean
  isError?: boolean
  errorMessage?: string
  /** Shapes the loading skeleton so the form does not jump when values land. */
  skeletonRows?: number
  /** The sections. None for a form with nothing to fill — its footer then stands alone, with no rule. */
  children?: ReactNode
  /** The save. Rendered inside the container and inside the form, below a rule. */
  footer?: ReactNode
  /**
   * Submit handler. Provide it whenever `footer` holds a `FormActions` — that
   * control is a `type="submit"` button and does nothing outside a form.
   */
  onSubmit?: () => void
  /** A transient notice about the record, rendered inside the container. */
  banner?: ReactNode
  /**
   * `form` — the form width, for a settings or account form and any form of a few fields.
   * `full` — the page's width, for a record whose groups of fields sit side by side
   * (`form-layout.md`, Width).
   */
  width?: 'form' | 'full'
}) {
  // Gated: a warm cache returns in milliseconds, and an ungated skeleton would
  // flash and read as broken rather than fast (`loading-states.md`).
  const showSkeleton = useDelayedLoading(isPending)

  return (
    <div className={width === 'full' ? 'w-full px-page-edge py-8' : 'mx-auto w-full max-w-3xl px-page-edge py-8'}>
      {heading === 'generic' ? (
        <PageHeading icon={icon} title={title} description={description} />
      ) : null}

      {isPending ? (
        showSkeleton ? (
          <Card className="mt-8">
            <CardContent aria-hidden>
              {Array.from({ length: skeletonRows }, (_, i) => i).map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton shape="caption" className="w-40" />
                  <Skeleton shape="field" className="w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null
      ) : isError ? (
        // A read failure must say so rather than render empty fields, which
        // would look like "nothing is configured" (constitution §X).
        <Alert variant="destructive" className="mt-8">
          {errorMessage}
        </Alert>
      ) : (
        <Card className={heading === 'generic' ? 'mt-8' : undefined}>
          <FormBody onSubmit={onSubmit}>
          {heading === 'identity' ? (
            <div className="flex flex-col gap-1 border-b-frame border-border-subtle px-4 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                {icon ? <RecordMark icon={icon} /> : null}
                <h1 className="type-screen-title">{title}</h1>
                {badges}
                {state ? <div className="ml-auto">{state}</div> : null}
              </div>
              {description ? (
                <p className="type-body text-muted-foreground">{description}</p>
              ) : null}
            </div>
          ) : null}

          {/* The footer sits INSIDE the form element, because `FormActions`
              submits — a save button outside its form does nothing, and the
              failure is silent. */}
          {/* A transient notice about the record — "created, invite sent" — sits
              inside the container above the fields, because it is about this
              object and not about the screen. */}
          {banner ? (
            <div className="border-b-frame border-border-subtle px-4 py-4">{banner}</div>
          ) : null}

            {children ? <CardContent inset="flush">{children}</CardContent> : null}
            {footer ? (
              <div
                className={
                  children
                    ? 'border-t-frame border-border-subtle px-4 pt-6 pb-6'
                    : heading === 'identity'
                      ? 'px-4 pt-6 pb-2'
                      : 'px-4 py-2'
                }
              >
                {footer}
              </div>
            ) : null}
          </FormBody>
        </Card>
      )}
    </div>
  )
}

/**
 * The card's body, as a `<form>` when there is something to submit and a plain
 * wrapper when there is not. A form element with no submit handler would swallow
 * Enter and reload the page.
 */
function FormBody({
  onSubmit,
  children,
}: {
  onSubmit?: () => void
  children: ReactNode
}) {
  if (!onSubmit) return <>{children}</>
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      {children}
    </form>
  )
}

/**
 * One region inside a {@link FormShell}. Divided from its neighbours by a rule
 * rather than framed as its own card — see the shell's note on nesting.
 *
 * A section with no `title` is the form's main body and carries no rule of its
 * own; a titled one is a distinct grouping.
 */
export function FormSection({
  title,
  description,
  summary,
  children,
  first = false,
  collapsible = false,
  defaultOpen = false,
  columns,
}: {
  title?: string
  description?: string
  /**
   * What the region currently holds, shown in the collapsed trigger — role
   * chips, a count, "not configured". A disclosure that states only its name
   * makes the reader open it to find out whether anything is in there, which
   * defeats collapsing it.
   *
   * **Non-interactive content only.** This renders inside the trigger button,
   * so a control here would be a nested interactive element — invalid, and it
   * swallows the click that opens the section. Put the controls in the body.
   */
  summary?: ReactNode
  children: ReactNode
  /** The first section carries no top rule — the card edge already divides it. */
  first?: boolean
  /**
   * For a region used a fraction of the time — changing a password, sending a
   * test. It does not get a permanent fraction of the page. Requires `title`,
   * which becomes the disclosure trigger.
   */
  collapsible?: boolean
  defaultOpen?: boolean
  /**
   * On a full-width form, the section's fields side by side in this many columns — fewer
   * as the screen narrows, one on a phone. Left out, they stack.
   */
  columns?: 2 | 3
}) {
  const divider = first ? '' : 'border-t-frame border-border-subtle'
  const body = columns ? SECTION_COLUMNS[columns] : null

  if (collapsible && title) {
    return (
      <Collapsible defaultOpen={defaultOpen} asChild>
        <section className={divider}>
          {/* The heading wraps the trigger rather than the reverse: the region
              needs a heading in the document outline whether it is open or shut,
              and a button that IS the h2 vanishes from the outline when
              collapsed. Radix supplies aria-expanded and aria-controls. */}
          <h2 className="type-section-heading">
            {/* `muted`, not `surface`: `surface` is the page canvas cards sit ON
                (design.md → Layout), so inside a card it reads as a hole rather
                than a highlight — in dark mode a very deep one, since the canvas
                sits well below the card. `muted` is the app's hover fill
                everywhere else (nav tree, table rows) and moves the right way in
                both themes. */}
            <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-4 py-4 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
              <span className="flex flex-col gap-tight">
                {title}
                {description ? (
                  <span className="type-body text-muted-foreground">
                    {description}
                  </span>
                ) : null}
                {summary ? (
                  <span className="font-body group-data-[state=open]:hidden">
                    {summary}
                  </span>
                ) : null}
              </span>
              <ChevronDown
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
              />
            </CollapsibleTrigger>
          </h2>
          <CollapsibleContent>
            {/* `pt-4` is not decoration. The trigger's hover fill covers its
                whole box, bottom padding included, so with no top padding here
                that fill's edge lands flush on the first control — a coloured
                band touching an input, which reads as the two belonging to one
                another. The gap is what separates the header from the body. */}
            <div className="flex flex-col gap-4 px-4 pt-4 pb-6">{body ? <div className={body}>{children}</div> : children}</div>
          </CollapsibleContent>
        </section>
      </Collapsible>
    )
  }

  return (
    <section className={`flex flex-col gap-default px-4 py-section ${divider}`}>
      {title ? (
        <div className="flex flex-col gap-tight">
          <h2 className="type-section-heading">{title}</h2>
          {description ? (
            <p className="type-body text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {body ? <div className={body}>{children}</div> : children}
    </section>
  )
}

/**
 * One row of fields inside a section, filling its width in this many columns — for a
 * section whose rows differ: an address over two columns, then city, state and ZIP over
 * three. Same spacing as a section's `columns`; one column on a phone.
 */
export function FormRow({ columns, children }: { columns: 2 | 3; children: ReactNode }) {
  return <div className={SECTION_COLUMNS[columns]}>{children}</div>
}

/** A section's field columns: one on a phone, two from a tablet, three from a wide screen. */
const SECTION_COLUMNS = {
  2: 'grid items-start gap-x-section gap-y-default md:grid-cols-2',
  3: 'grid items-start gap-x-section gap-y-default md:grid-cols-2 xl:grid-cols-3',
} as const
