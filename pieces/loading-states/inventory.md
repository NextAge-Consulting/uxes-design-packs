| File | Governs | Status |
|---|---|---|
| `loading-states.md` | Skeleton vs spinner, indicator gating, busy not disabled, a browse keeping its rows on every change | approved |

| Component | Use for | Type | Status |
|---|---|---|---|
| `modal-shell` | Screen content as a popup, ending with Close; `ModalNotice`, a must-read notice whose only way out is its one acknowledge button — no Close, no ✕, Escape and a click outside do nothing — busy while it records, its failure in a box directly above the button, its text as `ModalNoticeText` paragraphs and an optional link in its own words under them; and `ModalSection`, a divided region of a dialog | ModalShell | approved |
| `picker-dialog` | Choose one record from a searchable list; choosing it ends the dialog | PickerDialog | approved |

| Atom | Use for | Status |
|---|---|---|
| `screen-skeleton` | A screen's outline in placeholders — a heading and rows — while the screen a click went to loads | approved |
| `busy-status` | The live region a working control announces through, and `BusySlot`, the reserved spinner slot of a busy button | approved |
| `record-mark` | The framed icon beside a record's identity heading | approved |
