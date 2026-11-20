// ui-status: approved
// ui-block: PageBanner
import { Info, OctagonAlert, TriangleAlert, XIcon } from "lucide-react"
import type * as React from "react"

import { IconButton } from "@design-pack/ui/components/icon-button"
import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@design-pack/ui/components/ui/alert"

const LOOK = {
  info: { variant: "notice", Icon: Info },
  warning: { variant: "warning", Icon: TriangleAlert },
  urgent: { variant: "destructive", Icon: OctagonAlert },
} as const

/**
 * A standing notice above a screen's content, there until it is resolved or put
 * away — not the outcome of something the reader just did, which is `Alert` on its
 * own.
 *
 * `tone` picks the colours and the icon: `info`, `warning`, `urgent`. A banner is
 * there to be seen, so `info` takes the alert's `notice` look, never its quiet `info`
 * one, which a reader can pass over. The text goes
 * in as children, one `PageBannerText` per paragraph, and renders as plain text.
 * `action` is an optional link in its own words, under the text. Given `onDismiss`,
 * the banner shows a close button.
 */
function PageBanner({
  tone,
  title,
  action,
  onDismiss,
  children,
  ...props
}: {
  tone: keyof typeof LOOK
  title: string
  action?: { label: string; href: string } | null
  onDismiss?: () => void
  children?: React.ReactNode
} & Omit<React.ComponentProps<"div">, "title">) {
  const { variant, Icon } = LOOK[tone]
  return (
    <Alert variant={variant} data-slot="page-banner" {...props}>
      <AlertIcon>
        <Icon aria-hidden />
      </AlertIcon>
      <div className="flex items-start gap-related">
        <div className="grid min-w-0 flex-1 gap-y-tight">
          <AlertTitle>{title}</AlertTitle>
          {children}
          {action ? (
            <AlertDescription>
              <a href={action.href} className="font-emphasis underline underline-offset-4">
                {action.label}
              </a>
            </AlertDescription>
          ) : null}
        </div>
        {onDismiss ? <IconButton label="Close this message" icon={XIcon} size="icon-affix" onClick={onDismiss} /> : null}
      </div>
    </Alert>
  )
}

/** One paragraph of a banner's text. */
function PageBannerText(props: React.ComponentProps<"div">) {
  return <AlertDescription {...props} />
}

export { PageBanner, PageBannerText }
