# Wiring the confirm dialog

`ConfirmDialog` draws the question and its two answers. It is open whenever it is
rendered; your project decides when to render it and what each answer does.

## What you write

1. **The state that asks.** Render `ConfirmDialog` while a question is waiting and stop
   rendering it once it is answered. `onCancel` takes the safe answer; `onConfirm` takes
   the other.

2. **The words.** `title` is the question and `description` what the answer does.
   `confirmLabel` is a verb naming the answer; `cancelLabel` replaces "Cancel" where that
   would not say the safe answer. `busyLabel` is what a screen reader hears while the
   confirm runs. Set `destructive` when the answer removes something.

3. **The run.** Where `onConfirm` starts a write, set `confirming` while it is in flight
   and stop rendering the dialog when it returns.

4. **A guard for unsaved work.** A form that can be left with unsaved changes needs a
   component that takes whether the form is dirty, blocks your router's navigation while
   it is, and renders `ConfirmDialog` while a navigation is blocked: the title asks
   whether to leave without saving, `confirmLabel` discards the changes and lets the
   navigation proceed, `cancelLabel` stays on the page and resets the block, and
   `destructive` is set. Leave the browser's own prompt in place for closing the tab or
   reloading.
