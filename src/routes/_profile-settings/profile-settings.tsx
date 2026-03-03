import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_profile-settings/profile-settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_profile-settings/profile-settings"!</div>
}
