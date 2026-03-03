import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_customer/customer')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_customer/customer"!</div>
}
