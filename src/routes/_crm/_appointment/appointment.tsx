import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_crm/_appointment/appointment')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_crm/_appointment/appointment"!</div>
}
