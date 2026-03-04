import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_crm/_category/category')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/category/category"!</div>
}
