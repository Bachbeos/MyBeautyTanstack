import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_crm/_customer-source/customer-source')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_customer-source/customer-source"!</div>
}
