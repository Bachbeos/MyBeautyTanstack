import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_crm/_unit/unit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_unit/unit"!</div>
}
