// ui-status: approved
// ui-block: EmptyState
import type * as React from "react"

/**
 * What a list or region says when it has nothing to show — "No role matches
 * 'xyz'." One line in the state-message role, sitting where the list would be.
 * A table's own empty row is `TableCell kind="empty"`.
 */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="py-1 type-state-message text-muted-foreground">{children}</p>
}
