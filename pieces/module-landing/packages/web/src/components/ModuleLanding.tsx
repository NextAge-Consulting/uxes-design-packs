// ui-status: approved
// ui-block: ModuleLanding
import type * as React from "react"
import type { NavIcon } from "@design-pack/ui/components/app-shell/nav-types"
import { Card, CardContent, CardHeader, CardTitle } from "@design-pack/ui/components/ui/card"

/**
 * A module's entry screen: one card, the module's icon and name over what the module holds,
 * and an optional `notice` set off in a well beneath it.
 */
export function ModuleLanding({
  icon: Icon,
  title,
  notice,
  children,
}: {
  icon: NavIcon
  title: React.ReactNode
  notice?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-3xl p-page-edge">
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon aria-hidden className="size-5 text-primary-ink" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {children}
          {notice ? <p className="rounded-container bg-well p-3 type-body">{notice}</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
