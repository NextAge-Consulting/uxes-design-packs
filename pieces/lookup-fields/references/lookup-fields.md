---
kind: behaviour
code: [packages/ui/src/components/combobox.tsx, packages/web/src/components/fields.tsx]
block-types: cross-cutting
ui-status: approved
---

# Lookup fields

**A field whose value is chosen from somewhere else is one control, whatever it looks up;
the screen picks the source and whether creating is allowed, and nothing else about the
control changes.**

## When it applies

Every field whose value comes from a list: an account, a vendor, a class, a location.

## How to build it

- **The words.** A **Select** is a closed dropdown: click, pick, no typing. A **Combobox**
  is a text input with a list that filters as you type. Use these words in code, comments
  and docs.
- **A lookup is an inline input with a dropdown panel.** Converting a legacy lookup
  window keeps its search, its pick and its exact-match short-circuit, and drops the
  window.
- **The source decides the backing:**
  - a cached reference list → `SelectField` at fifteen rows or fewer, `ComboboxField`
    above; create optional;
  - the distinct values stored in a column → `ComboboxField`; create opt-in, and rare.
- **"Can create" is a prop on either source, never a third control.**
- **A list the user may add to is a Combobox at any length.**
- **Search filters in the browser, across every field the row shows** — a number and a
  name match in the same query.
- **Bind the list with `useQuery`, never `useSuspenseQuery`.**
- **The list holds the active rows plus the current value, even when its row is
  inactive.**

### Create is a row in the list

- Typing what matches nothing shows a row labelled with what was typed — `Add "Acme
  Supply Co"` — which opens a minimal create form. The row exists only when nothing
  matches.
- A user without the create permission never sees the row.
- On create, select what was just made, and for a cached source invalidate the cache on
  both sides.
- The create form asks for what the target system requires and the one or two fields the
  person filling this form has. Nothing more.

### Where a control goes

| The control… | Goes |
|---|---|
| changes what the list shows — a type scope, include-inactive | the panel footer, as `OptionSwitch` |
| acts on the value already selected — open its record | in the field, as an icon |
| creates | a row in the list |

**Nothing that belongs to a lookup sits beside the field.**

- **A lookup's list filter is an `OptionSwitch` in the footer, both states named**
  (`Asset accounts | All accounts`, `Active vendors | All vendors`).
- **Opening the selected value's record goes in the same tab.** The record the field
  sits on covers unsaved edits with `UnsavedChangesGuard`. Where that record's screen does
  not exist yet, render the icon inert with a `TODO` naming the work.

### Scope is declared at the call site

- A field that takes only some of the options declares which, and opens already narrowed.
- The scope, and every fixed option or filter list, is a tested function in
  the shared module, never a constant in the component. It offers only values something
  actually writes, never a combination the target system would refuse.
- **A clearable value gets an explicit "(none)" row**, not only the clear button.
- **Busy, never `disabled`, while the list loads.** `disabled` is for a field with nothing to
  choose — its list failed to load.

### The distinct source

- **Only the screen that brings the thing into existence may create a novel value.**
  Receiving stock into a bin creates the bin; a screen that writes a default to another
  column offers what exists, and an unmatched query says so.
- **The write canonicalises:** it trims, then stores the existing spelling when one
  matches, server-side in the shared module.

## Excluded

- A popup window, a modal or a second screen as a lookup.
- A `+` button beside the field, and an expanding inline create panel.
- Editing the looked-up record from inside the form — navigate to its own record.
- A checkbox, a one-way link or a single flipping button as a lookup's list filter.
- A worded button for the selected value's action, a hover-revealed one, and opening it
  in a new tab.
- Runtime checkboxes asking the user to re-state a scope the call site knows.
- Rename or retire on a distinct-value vocabulary; promote it to a table when that is
  needed.
