import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_crm/_manager-users/manager-users')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_manager-users/manager-users"!</div>
}
