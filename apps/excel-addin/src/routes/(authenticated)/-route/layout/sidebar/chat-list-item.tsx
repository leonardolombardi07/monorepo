import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "@repo/ui/components/sidebar";
import { Link, useParams } from "@tanstack/react-router";
import { MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { m } from "@/lib/internationalization";

type ChatSummary = {
  id: string;
  title: string;
  pinned: boolean;
};

export function ChatListItem({ chat }: { chat: ChatSummary }) {
  // Not strict, as the sidebar sits outside the chat's route
  const { chatId } = useParams({ strict: false });
  const [renaming, setRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={chat.title}
        isActive={chat.id === chatId}
        render={<Link to="/chats/$chatId" params={{ chatId: chat.id }} />}
      >
        <span className="truncate">{chat.title}</span>
      </SidebarMenuButton>

      {/* Kept mounted while renaming, so closing it hands focus to the input */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<SidebarMenuAction showOnHover />}
          aria-label={m.sidebar_chat_options()}
          className={renaming ? "hidden" : undefined}
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="start"
          className="w-40"
          // Focus goes to the title input, not back to the trigger, when renaming
          finalFocus={renaming ? inputRef : undefined}
        >
          <DropdownMenuItem onClick={() => alert("pin chat")}>
            {chat.pinned ? <PinOff /> : <Pin />}
            {chat.pinned ? m.sidebar_chat_unpin() : m.sidebar_chat_pin()}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRenaming(true)}>
            <Pencil />
            {m.sidebar_chat_rename()}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem variant="destructive" onClick={() => alert("Not implemented")}>
            <Trash2 />
            {m.sidebar_chat_delete()}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
