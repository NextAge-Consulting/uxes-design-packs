---
kind: behaviour
code: [packages/ui/src/components/report-link.tsx, packages/ui/src/components/prompt-dialog.tsx, packages/web/src/components/PdfPages.tsx, packages/web/src/components/RowActions.tsx]
block-types: cross-cutting
ui-status: approved
---

# Documents

In a public-facing app an existing document to read now is shown in the page; a report the app generates opens in a new tab; a document to keep is a labelled download. In an internal app an existing document opens in a new tab, like a report.

## Read now — shown in the page

- In a public-facing app, an existing document opens on its own screen, every page drawn at the card's width by `PdfPages`, never a browser PDF embed (`iframe`, `embed`, `object`).
- The same screen carries its download in the card header, built as below.

## A generated report — a new tab

- A report built from the reader's choices — a history, a summary, a usage report — opens in a new tab, in the browser's own PDF viewer, at the window's size.
- A button is a `ReportLink` to the report's address with no `download`; on a row it is `RowActions`' `report` icon.
- In an installed app or the Android store app (the `installed` variant) `ReportLink` saves the report instead, reading `Download PDF`.
- The server sends it `inline`, named for the record and the report.
- In an internal app an existing document — one from a record's history, or one just made — opens this way.

## Keep — a download

- A form to sign or keep, a document's own PDF in a public-facing app, a spreadsheet: a button-styled link with `download`, to the file URL with `?download=1`.
- The server sends it as `attachment`, named for the record and the document.

## The label

- A report: `Open PDF`, led by the new-tab icon, its name for a screen reader ending "(opens in a new tab)".
- A download: `Download PDF` where the title of the card holding the button names the document; `Download <Document> PDF` everywhere else. The `Download` icon leads it.

## Excluded

- No other document opens a new tab or window.
- No `Print` button: the reader prints from the report's tab, or from what they downloaded.
