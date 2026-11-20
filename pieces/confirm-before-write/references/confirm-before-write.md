---
kind: behaviour
code: [packages/ui/src/components/review-dialog.tsx]
block-types: [ReviewDialog]
ui-status: approved
---

# Confirm before write

**An action that writes to a system we do not own runs a dry pass first, reports what it
would do in a `ReviewDialog`, and writes only on an explicit confirm.**

## When it applies

Consequence plus irreversibility, not importance.

| Earns a confirm | Does not |
|---|---|
| Sending records into another organisation's system | Saving a record we own |
| An import that reconciles against another system's data | A search, a filter, a navigation |
| Anything a support call would follow | Anything undone by editing and saving again |

A routine, reversible action gets no confirm.

## Two steps, every time

- One button runs the dry pass and opens the report; the confirm in the report runs the
  write. Never a "Preview" toggle, and never a way to skip the report.
- The dry pass writes nothing. The confirmed run reads the source again and sends what it
  reads then — never a cached dry-run payload.

## The report

It carries the run's actual figures, never a restatement of the request:

- **The identity** — which record, which period, which target system.
- **The figures**, as `StatReadout` tiles in one row: counts at the grain the payload uses,
  and a total where money is involved.
- **A reconciliation, where one exists** — two totals and their difference.
- **Every row a person has to act on, listed individually**, never as a count.

A report that could be written before the dry run is not a report.

Where validation proves the write would be wrong, the confirm is disabled
(`confirmDisabled`) and every blocking condition is listed with the subject it belongs to —
the record, the code — never as a total.

## The confirm

- It is labelled with what it commits to, at the magnitude it commits to — `Send 42
  items — $1,204.00` — never `OK`.
- The magnitude is a figure the report shows. Where no single figure carries the
  consequence, it names the act and stops: `Run Import`.
- The figures and the label carry the seriousness; colour is never the only signal.

## After the run

The same `ReviewDialog`, out of preview, reports what was done, with every row the confirm
step showed.
