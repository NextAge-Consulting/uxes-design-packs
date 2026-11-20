---
kind: behaviour
code: [packages/ui/src/components/restricted-value.tsx]
block-types: cross-cutting
ui-status: approved
---

# Permission-masked fields

**Hide what the user may not use. Mask a value the user may not see when its absence
would read as a fact.**

## When it applies

Every value or action the signed-in user's permissions withhold, on every surface it
appears on. Inside a staff view, `staff-views.md` governs instead.

## How to build it

| Situation | Treatment |
|---|---|
| An action the user cannot perform — a button, a menu entry, a whole module | **Hide.** |
| A field whose absence would read as "no value exists" — money, dates, quantities, status | **Mask** with `RestrictedValue`. |
| A value genuinely absent, not applicable, or not entered yet | **Neither** — an empty state. |

### The server withholds; the screen shows what it was told

1. The server function checks the permission and removes the values from the response.
2. The response names what it withheld — a `restricted: ['cost']` list beside the
   record.
3. The screen renders `RestrictedValue` from that list.
4. A masked numeric field keeps its type and carries a neutral stand-in (`0`, `""`); the
   `restricted` list is what the screen reads.

### Every write restores what was masked

Before any write, put the persisted values back over whatever the client sent for the
masked fields, read server-side.

### One list of governed fields, applied at every surface

- The governed fields are one list in the shared module, applied at each server boundary that
  returns them: the record, the browse, the export, and anywhere else the value renders.
- A field withheld on the record is withheld in its browse.
- A governed field joins that list in the change that first shows it on any surface.
- In a table, the `restricted` marker reaches the cells through the table's `meta`, so
  the column set stays a module constant.

## Excluded

- Blurring or hiding a value in the browser while the server still sends it.
- Re-deriving the user's permissions in the client to decide what to mask.
- Widening a masked field's type to `number | null`.
- Taking a masked field's original value from the client's copy on write.
- Masking an empty value, or presenting it as restricted.
