import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_crm/_user/user')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_crm/_user/user"!</div>
}
