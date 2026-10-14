import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(not-authenticated)/login/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(not-authenticated)/login/"!</div>;
}
