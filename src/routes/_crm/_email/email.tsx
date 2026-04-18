import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_crm/_email/email")({
  component: EmailRedirect
});

function EmailRedirect() {
  return <Navigate to="/send" />;
}
