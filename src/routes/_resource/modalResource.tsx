import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_resource/modalResource")({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/resource/modalResource"!</div>;
}
