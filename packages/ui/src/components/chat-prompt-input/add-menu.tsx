import { Paperclip, Plus } from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { FileUploadTrigger } from "../file-upload";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { OptionText } from "./option-text";

export type ChatPromptInputOption = { id: string; name: string; description?: string };

/** Things to pick in a submenu of the add menu, e.g. tools or skills. */
export type ChatPromptInputGroup = {
  /** Also names the group's test ids, e.g. `prompt-input-tools`. */
  id: string;
  icon: ComponentType<{ className?: string }>;
  /** The submenu, e.g. "Tools". */
  label: string;
  /** Shown when there are no options, e.g. "No tools available". */
  emptyLabel: string;
  /** What a picked option is, on its attachment card, e.g. "Tool". */
  itemLabel: string;
  options: ChatPromptInputOption[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  /** Picking an option replaces the one picked before. */
  single?: boolean;
};

export type ChatAddMenuLabels = {
  /** The menu's button. */
  add: string;
  addFiles: string;
};

export type ChatAddMenuProps = {
  groups: ChatPromptInputGroup[];
  /** Offers to add files, which needs a `FileUpload` around the menu. Defaults to true. */
  showFiles?: boolean;
  labels: ChatAddMenuLabels;
};

export function ChatAddMenu({ groups, showFiles = true, labels }: ChatAddMenuProps) {
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
                  aria-label={labels.add}
                  data-testid="prompt-input-add"
                />
              }
            />
          }
        >
          <Plus />
        </TooltipTrigger>
        <TooltipContent>{labels.add}</TooltipContent>
      </Tooltip>

      <DropdownMenuContent side="top" className="w-56">
        {showFiles && (
          <FileUploadTrigger render={<DropdownMenuItem data-testid="prompt-input-add-files" />}>
            <Paperclip />
            {labels.addFiles}
          </FileUploadTrigger>
        )}

        {showFiles && groups.length > 0 && <DropdownMenuSeparator />}

        {groups.map((group) => (
          <GroupSubmenu key={group.id} group={group} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GroupSubmenu({ group }: { group: ChatPromptInputGroup }) {
  const { icon: Icon, label, emptyLabel, options, selectedIds, onSelectedIdsChange } = group;
  const single = group.single ?? false;
  const testId = `prompt-input-${group.id}`;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger data-testid={testId}>
        <Icon />
        <span>{label}</span>
        {selectedIds.length > 0 && (
          <span className="ml-auto text-muted-foreground text-xs tabular-nums">
            {selectedIds.length}
          </span>
        )}
      </DropdownMenuSubTrigger>

      <DropdownMenuSubContent className="w-72">
        {options.length === 0 && <DropdownMenuItem disabled>{emptyLabel}</DropdownMenuItem>}
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.id}
            checked={selectedIds.includes(option.id)}
            onCheckedChange={(checked) =>
              onSelectedIdsChange(
                checked
                  ? single
                    ? [option.id]
                    : [...selectedIds, option.id]
                  : selectedIds.filter((id) => id !== option.id),
              )
            }
            // Several can be picked in a row, unless only one can
            closeOnClick={single}
            data-testid={`${testId}-${option.id}`}
          >
            <OptionText name={option.name} description={option.description} />
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
