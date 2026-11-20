# Wiring documents

The piece draws and links documents; the receiving project serves them. It writes the
file routes `ReportLink`'s `href`, `PdfPages`' `src` and every download link point at.

## Serve each document from a route behind the session

- One GET route per kind of document — a stored document by its id, a generated report
  by the reader's choices in the query string.
- Check the session in the route. A request that is signed out, or for a document that
  is not the signed-in person's to read, gets the same empty response as a document
  that does not exist.
- Build or read the bytes in the request and stream them back; never write the file to
  a public folder.
- Validate the query string before building anything; refuse a choice the report does
  not offer.
- Log a failure in full and answer with an empty error response.

## Set how the browser treats the file

- `content-type` is the file's own — `application/pdf` for a PDF.
- `content-disposition` is `inline` by default, so `ReportLink` opens the report in the
  browser's own viewer and `PdfPages` can read it.
- With `?download=1` on the address it is `attachment`, so the browser saves it. A
  download link adds `?download=1` and the `download` attribute.
- A spreadsheet is always an `attachment`.
- Give every response a `filename`, named for the record and the document, with every
  character outside letters, digits, `.`, `-` and `_` replaced.

## Give the piece the addresses

```tsx
function ReportLink({ href, variant, onClick }: {
  href: string | null
  variant?: "default" | "outline" | "secondary"
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
})

function PdfPages({ src, title }: { src: string; title: string })
```

- `href` is the report route's address with the reader's choices as its query string, or
  `null` while those choices cannot make a report — the screen says why beside the link.
- `src` is the document route's address, without `?download=1`. `PdfPages` fetches it
  with the session's cookies, so the route must be on the app's own origin.
- `title` names the document; each page is announced as `<title>, page n of m`.

`PdfPages` logs through `logger` from the project's shared package and shows an
`ErrorState` when the document cannot be drawn.
