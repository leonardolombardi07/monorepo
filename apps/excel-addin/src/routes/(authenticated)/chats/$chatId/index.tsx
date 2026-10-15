import { createFileRoute } from "@tanstack/react-router";
import { Chat } from "@/components/chat";

export const Route = createFileRoute("/(authenticated)/chats/$chatId/")({
  component: Page,
});

function Page() {
  return <Chat initialMessages={[]} />;
}
