---
kind: behaviour
code: [packages/web/src/components/fields.tsx, packages/ui/src/components/option-switch.tsx]
block-types: [FieldGroup]
ui-status: approved
---

# Boolean fields

**A true-or-false value is a switch: one fixed label when it is on or off, both names
when it is a choice between two options.**

## When it applies

Every true-or-false value a person sets — on a form, in a dialog, in a list's filter. Ticking any number of rows or items in a list is a checkbox apiece, and `FacetChecklist`
owns multi-select filtering.

## Which form

Write down what each state is called, then:

- **On/off** — the off name is only the on name negated (not, no, un-, in-, off).
  `SwitchField`.
- **Options** — each name is a different thing of the same kind, and one noun captions
  the pair: a role, an audience, an address. `OptionSwitchField`, or `OptionSwitch` where
  the value is not a form field.
- **Ask the human which it is** when the off name is one you had to invent: it is not on
  the screen being converted, elsewhere in the product, or in what the human said.

## How to build it

On/off:

- `label` names what is so while the switch is on, in sentence case, and stays the same
  in both states — "Allow comments", "Send reminders", "Active".
- The off state gets no words of its own.
- In a grid, pass `bare`: the switch stands alone and the column heading is its label.

Options:

- `offLabel` and `onLabel` are the options' names, in sentence case — "Standard user",
  "Owner".
- Where the two names alone do not say what is being chosen, the noun that captions the
  pair is on screen: the heading the switch sits under, or its `caption` — "Delivery
  Address" over "Home address | Different address". "Read-only | Full edit" needs none.
- `offHint` and `onHint` show under the switch while that option is chosen. Give one only
  for a fact the option's name cannot carry — the address receipts are emailed to.

Both:

- Pass `caption` in a row of captioned fields, and leave it off under a heading that
  already names the switch.
- A record's own active/inactive goes where `form-layout.md` puts it. Every other switch
  is an ordinary field, in the region whose Save writes it.
- A switch that writes immediately, with no Save, goes busy rather than disabled while
  the write is in flight (`loading-states.md`): pass `OptionSwitch` its `busyLabel` and
  `busy`.

## Excluded

- No label or sentence that changes with the state.
- No status badge beside a switch.
- No checkbox or radio pair for a true-or-false value.
- A choice drawn as two segments in one track is built only when the human asks for it by
  name.
