import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_service/service')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_service/service"!</div>
}
