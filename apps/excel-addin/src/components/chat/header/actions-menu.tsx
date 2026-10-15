import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { Archive, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { m } from "@/lib/internationalization";

type ActionsMenuProps = {
  /** Where focus goes when the menu closes, e.g. the title input after Rename. */
  finalFocus?: React.RefObject<HTMLElement | null>;
  onRename: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

export function ActionsMenu({ finalFocus, onRename, onArchive, onDelete }: ActionsMenuProps) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  aria-label={m.chat_header_actions()}
                  data-testid="chat-header-actions"
                />
              }
            />
          }
        >
          <MoreHorizontal />
        </TooltipTrigger>
        <TooltipContent>{m.chat_header_actions()}</TooltipContent>
      </Tooltip>

      <DropdownMenuContent className="w-40" finalFocus={finalFocus}>
        <DropdownMenuItem onClick={onRename} data-testid="chat-header-rename">
          <Pencil />
          {m.chat_header_rename()}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onArchive} data-testid="chat-header-archive">
          <Archive />
          {m.chat_header_archive()}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={onDelete} data-testid="chat-header-delete">
          <Trash2 />
          {m.chat_header_delete()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
