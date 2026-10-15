import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/chats/")({
  component: Page,
});

function Page() {
  return (
    <div className="px-10 py-5">
      <h1>Chats</h1>
    </div>
  );
}
