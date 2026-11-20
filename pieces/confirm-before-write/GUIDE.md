# Wiring confirm before write

This piece is the rule. The screen half is `ReviewDialog`, with `StatReadout` for the
figures. Your project writes the server half and the screen's two calls.

## What you write

1. **One server function that does both runs.** Its input carries a `preview` flag that
   defaults to true. It reads the source, builds the payload and builds the report on
   every call. With `preview` true it returns the report and writes nothing. With
   `preview` false it sends what it has just built — never a payload kept from the
   earlier call.

2. **A report type the function returns.** It carries `preview: boolean`, the identity of
   the run, the counts and totals the payload holds, every row a person has to act on,
   and a list of blockers — each a reason with the subject it belongs to. An empty list
   means the write may proceed.

3. **The server refuses a blocked confirm.** When `preview` is false and the list of
   blockers is not empty, the function writes nothing and fails. The disabled button is
   never the only guard.

4. **The screen calls it twice.** One button calls with `preview: true` and opens
   `ReviewDialog` on the report, `preview` set. `onConfirm` calls again with
   `preview: false`; `confirming` is true while it runs. Set `confirmDisabled` when the
   report has blockers, and build `confirmLabel` from a figure the report shows. When the
   confirmed run returns, show its report in the same dialog with `preview` false.
