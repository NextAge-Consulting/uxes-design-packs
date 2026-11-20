// ui-status: approved
// ui-atom
// ui-behaviour: table-row-actions.md
import { createLink } from '@tanstack/react-router'
import { IconButton } from '@design-pack/ui/components/icon-button'

/**
 * `IconButton` as an in-app link: the router supplies its `href` and click
 * handling, so a row's view icons navigate without a page load and still
 * middle-click and copy like any link. The package imports no router, so the app
 * makes the link (`ui-components.md`, App shell).
 */
export const IconLink = createLink(IconButton)
