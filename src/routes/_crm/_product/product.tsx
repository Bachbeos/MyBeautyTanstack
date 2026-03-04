import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_crm/_product/product')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_product/product"!</div>
}
