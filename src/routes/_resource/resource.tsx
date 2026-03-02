import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_resource/resource")({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/resource/resource"!</div>;
}
