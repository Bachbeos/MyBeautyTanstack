import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_crm/_voucher/voucher')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_crm/_voucher/voucher"!</div>
}
