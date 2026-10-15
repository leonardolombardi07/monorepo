import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { useNavigate, useParams } from "@tanstack/react-router";
import { m } from "@/lib/internationalization";

/** Asks before a chat is deleted, as it can't be undone. */
export function DeleteChatDialog({
  open,
  onOpenChange,
  title,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The chat's title, named in the question. */
  title: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{m.chat_delete_title()}</DialogTitle>
          <DialogDescription>{m.chat_delete_description({ title })}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{m.chat_delete_cancel()}</DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          >
            {m.chat_delete_confirm()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Deletes a chat: stops its reply, removes it and its messages, and leaves its
 * page for a new chat if that's where the user is.
 */
export function useDeleteChat() {
  // Not strict, as this is used outside the chat's route too, e.g. the sidebar
  const { chatId: openChatId } = useParams({ strict: false });
  const navigate = useNavigate();

  return async (chatId: string) => {
    alert("NOT IMPLEMENTED");
    if (chatId === openChatId) await navigate({ to: "/new", replace: true });
  };
}
