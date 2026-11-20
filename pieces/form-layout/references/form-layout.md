---
kind: recipe
frame: FormShell
block-types: [RecordScreen]
ui-status: approved
---

# Record screen

One thing edited on its own screen is a `FormShell`, built by picking each choice below
from its list. How it saves is `saving.md`.

## When it applies

Every screen of one thing on its own page, edited or only read: a record, an account page,
preferences, a prompt screen. A record edited beside the list it was opened from is an `EntityModal`; a
container that becomes its own form in place is `inline-form.md`.

## Edited · read-only

- **Edited** — a `FormShell`, built by every choice below.
- **Read-only** — a record nothing on the screen changes in place, each change made through
  a button and its dialog. In the page gutter (`BrowseScreen`): the `Breadcrumb` from the
  list; a `RecordHeader` with the record's icon, name, badges, identifying line, and its
  buttons in the footer; `Card`s of `FactList`s in a `CardGrid`; then full-width cards — a
  figure card, the record's `ChildList`. The choices below do not apply to it.
- **A screen nested under a read-only record** — a document, its PDF, its charts: in a centred
  column, the `Breadcrumb` from the list through the record to this screen, then the
  screen's card. No page heading.

## Heading — `generic` · `identity`

- **`generic`** when the title names the screen (Preferences, Settings): the `h1` sits
  above the container.
- **`identity`** when the title is the record's own name: the `h1` sits inside the
  container, with the record's status `badges` beside it and its active/inactive
  `SwitchField` in `state`.
- **A prompt screen** — one prompt, its choices, then the action they feed — is built as a
  `PromptDialog` is: its title and description inside its one card, above the choices and
  the action. With no choices, the heading, then its action.
- Whatever the page is about is the only `h1`. Never a screen title and a record name both.

## Regions — one · two or more

- **One:** one `FormSection`; the save in the container's footer.
- **Two or more:** `FormSection`s inside the one container, which owns the save.

## Header furniture — none · KPIs and facet tiles

KPIs (`StatReadout`s in a `StatRow`) and `FacetTile`s go with the identity heading, and
only when the record has derived figures worth surfacing.

## Grouping fields — sequence · peers

- **Sequence** — swapping the order would change how it reads: divided regions,
  `FormSection`s or `Subsection`s inside one.
- **Peers** — independent concerns about one record, scanned side by side: `FieldCard`s in
  a `FieldCardGrid`.
- Up to two divided regions carry no headings. Three or more are each named.
- Cards hold short fields. Long-form text, a table, a dual list or anything else that wants
  width gets a full-width region.
- A panel a facet tile opens is a `DetailPanel`, keeping its own frame.
- Inside a tab, the tab strip is the frame: group the panel's contents by sequence or
  peers, with no card around them.

## Width — form · full

- A form stays at the form width; a settings or account form always does.
- A screen is full width only when its content needs it — a KPI row, a wide table, child
  collections. One wide table inside a narrow form scrolls in its own container.
- A record with many short fields is full width too (`FormShell width="full"`): its
  sections stack, each across the page, with its fields in columns inside it
  (`FormSection columns`), never as panels side by side.
- Lay each section's rows out so related fields share a row — Address | Address 2; City |
  State | Zip; Phone | Email | Website — with `FormRow` where its rows differ.

## Read-only values — `StatReadout` · `ReadOnlyField` · `Fact`

- A headline figure in a record header: `StatReadout`.
- A value inside a form, among fields to type into: `ReadOnlyField`.
- Facts read on their own: `Fact`s in a `FactList`.

They are not interchangeable.

## Where the save sits

- `FormActions` sits at the end of the region whose values it writes: everything above it
  in the same container is what it saves.
- On a parent/child record, the save sits at the end of the parent's field regions, above
  the child tabs and tables. A child panel saves itself through its own form, inside that
  panel.
- Never two controls that perform the same save.
- In a sectioned form with a jump-nav, Save is the jump-nav's last entry.

## Leaving — `Close` · `Breadcrumb`

- **`Close`**, in `FormActions`, on a record one level below its list on a form card. It
  goes to the parent browse route the record route already knows, the same however the
  person arrived.
- **`Breadcrumb`**, and no `Close`, on every screen of a nest more than one level below a
  list — a record, then its documents and charts — from the list down. The list's crumb
  returns to the page of the list it was left on.

## A rarely-used panel — open · collapsed

- An action used a fraction of the time goes in a collapsible `FormSection`, never a
  dialog. A panel that performs an action rather than editing the record saves with
  `FormActions mode="action"`.
- A collapsed section states what it holds in its `summary`: chips, a count, "not
  configured", "last sent Tuesday".

## Exceptions

A screen departs from a choice above only as an exception, with the human's reason where
it is made (`design-accepted — <reason>`).
