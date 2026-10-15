import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/chats/")({
  component: Page,
});

function Page() {
  return <div>Hello</div>;
}
