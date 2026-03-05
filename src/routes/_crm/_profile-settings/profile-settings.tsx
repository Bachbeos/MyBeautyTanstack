import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_crm/_profile-settings/profile-settings',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_crm/_profile-settings/profile-settings"!</div>
}
