import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_customer-source/customer-source')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_customer-source/customer-source"!</div>
}
