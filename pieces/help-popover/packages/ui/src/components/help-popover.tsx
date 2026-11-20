// ui-status: approved
// ui-block: HelpPopover
import type * as React from "react"

import { Button } from "@design-pack/ui/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@design-pack/ui/components/ui/popover"

/**
 * A link that opens a short explanation beside it — where to find a value, what a
 * field means. Read-only, and it closes on click-away. A panel that sets filters is
 * a `FilterPopover`.
 */
export function HelpPopover({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="link" className="self-start">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent inset="form">
        <PopoverHeader>
          <PopoverTitle>{title}</PopoverTitle>
          <PopoverDescription>{children}</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}
