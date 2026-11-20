// ui-status: approved
// ui-atom
import type * as React from "react"
import { Moon, Sun } from "lucide-react"

import { IconButton } from "@design-pack/ui/components/icon-button"

/**
 * Light/dark switch. Fully controlled — the shell owns theme state (and its
 * persistence) so this stays presentational and renders in the design feed.
 * Dark is a token swap on a `.dark` ancestor; no component carries `dark:`.
 */
function ThemeToggle({
  theme,
  onToggle,
  ...props
}: {
  theme: "light" | "dark"
  onToggle: () => void
} & Omit<
  React.ComponentProps<typeof IconButton>,
  "onClick" | "label" | "icon" | "size"
>) {
  const dark = theme === "dark"
  return (
    <IconButton
      data-slot="theme-toggle"
      label={dark ? "Switch to light mode" : "Switch to dark mode"}
      icon={dark ? Sun : Moon}
      onClick={onToggle}
      {...props}
    />
  )
}

export { ThemeToggle }
