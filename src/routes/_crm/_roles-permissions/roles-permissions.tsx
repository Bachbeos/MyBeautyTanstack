import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_crm/_roles-permissions/roles-permissions')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_roles-permissions/roles-permissions"!</div>
}
