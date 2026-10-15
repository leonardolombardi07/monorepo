import { cn } from "cn";
import type React from "react";
import { useRef, useState } from "react";
import { ActionsMenu } from "./actions-menu";
import { DeleteChatDialog } from "./delete-chat";
import { RenameInput } from "./rename-input";

type ExistingChat = {
  chatId: string;
  title: string;
};

export type HeaderProps = {
  chat?: ExistingChat;
  /** Whether the sidebar on the right of the chat is open. */
  className?: string;
};

export function Header({ chat, className }: HeaderProps) {
  const [renaming, setRenaming] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <header
      className={cn("flex h-10 shrink-0 items-center gap-1 bg-background px-3", className)}
      data-testid="chat-header"
    >
      {/* `min-w-0` lets a long title truncate instead of pushing the toggle out */}
      <div className="flex min-w-0 items-center gap-1">
        <ChatTitle
          renaming={renaming}
          setRenaming={setRenaming}
          inputRef={inputRef}
          title={chat?.title}
        />

        {chat && (
          <ActionsMenu
            finalFocus={renaming ? inputRef : undefined}
            onRename={() => setRenaming(true)}
            onArchive={() => alert("Archiving...")}
            onDelete={() => setDeleteOpen(true)}
          />
        )}
      </div>

      {chat && (
        <DeleteChatDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={chat.title}
          onConfirm={() => alert("Deleting...")}
        />
      )}
    </header>
  );
}

function ChatTitle({
  title,
  renaming,
  setRenaming,
  inputRef,
}: {
  renaming: boolean;
  setRenaming: (rename: boolean) => void;
  title?: string;
  inputRef: React.Ref<HTMLInputElement>;
}) {
  if (!title) {
    return null;
  }

  if (renaming) {
    return (
      <RenameInput
        ref={inputRef}
        title={title}
        onDone={(next) => {
          setRenaming(false);
          if (next) alert("Renaming");
        }}
        className="h-7 w-72 max-w-full font-medium text-sm"
      />
    );
  }

  return (
    <h1
      className="truncate font-medium text-sm"
      data-testid="chat-header-title"
      onDoubleClick={() => setRenaming(true)}
    >
      {title}
    </h1>
  );
}
