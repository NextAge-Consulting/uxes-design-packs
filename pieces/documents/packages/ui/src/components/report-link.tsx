// design-accepted — `report` names the kind of document, a report the app generates, not one business record
// ui-status: approved
// ui-atom
// ui-behaviour: documents.md
import { Download, ExternalLink } from "lucide-react"
import type * as React from "react"

import { Button } from "@design-pack/ui/components/ui/button"

/**
 * A generated report opened in a new tab, in the browser's own PDF viewer — read at the
 * window's size, then printed or saved from there (`documents.md`). It reads `Open PDF`,
 * led by the new-tab icon, and is announced as opening a new tab, so nobody is moved
 * without warning; the screen they came from stays as it was.
 *
 * In an installed app (`installed`) there is no tab to open: a new tab leaves the app
 * for a browser that is not signed in, so the link saves the PDF instead and reads
 * `Download PDF`.
 *
 * `href` is null while the reader's choices cannot make the report: the link is then
 * unavailable, a disabled button, and the screen says why beside it. A file to keep is
 * a download, never this.
 */
function ReportLink({
  href,
  variant,
  onClick,
}: {
  href: string | null
  variant?: "default" | "outline" | "secondary"
  /** Runs as the tab opens — a dialog closing itself. */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}) {
  if (!href) {
    return (
      <Button type="button" variant={variant} disabled>
        <ExternalLink />
        Open PDF
      </Button>
    )
  }
  return (
    <>
      <Button asChild variant={variant} className="installed:hidden">
        <a href={href} target="_blank" rel="noreferrer" onClick={onClick}>
          <ExternalLink />
          Open PDF
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </Button>
      <Button asChild variant={variant} className="hidden installed:inline-flex">
        <a href={href} download onClick={onClick}>
          <Download />
          Download PDF
        </a>
      </Button>
    </>
  )
}

export { ReportLink }
