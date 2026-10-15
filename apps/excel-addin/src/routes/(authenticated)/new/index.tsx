import { createFileRoute } from "@tanstack/react-router";
import { Chat } from "@/components/chat";

export const Route = createFileRoute("/(authenticated)/new/")({
  component: Page,
});

function Page() {
  return <Chat />;
}
