import { Button } from "@repo/ui/components/button";
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
} from "@repo/ui/components/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { cn } from "cn";
import { Paperclip, Plus } from "lucide-react";
import { type ComponentProps, type ReactNode, useRef } from "react";
import { OptionText } from "./option-text";

/** Something that can be picked in a submenu, e.g. a tool or a skill. */
export type AddMenuOption = {
  id: string;
  name: string;
  description?: string;
};

/** A submenu of options to pick, e.g. the tools the agent may use. */
export type AddMenuSelection = {
  /** Keys the submenu and its test ids. */
  id: string;
  label: string;
  icon?: ReactNode;
  /** Shown when there are no options. */
  emptyLabel: string;
  options: AddMenuOption[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  /** Picking an option replaces the one picked before. */
  single?: boolean;
};

export type AddMenuLabels = {
  /** Names the trigger, and shows as its tooltip. */
  trigger: string;
  addFiles: string;
};

const DEFAULT_LABELS: AddMenuLabels = {
  trigger: "Add",
  addFiles: "Add files",
};

type ContentProps = ComponentProps<typeof DropdownMenuContent>;

export type AddMenuProps = {
  /** Called with the files picked. Without it, the menu has no "Add files" item. */
  onAddFiles?: (files: File[]) => void;
  /** The file types the picker offers, as in `<input accept>`. */
  accept?: string;
  selections?: AddMenuSelection[];
  labels?: Partial<AddMenuLabels>;
  icon?: ReactNode;
  disabled?: boolean;
  /** Classes for the trigger. */
  className?: string;
  contentClassName?: string;
  side?: ContentProps["side"];
  align?: ContentProps["align"];
  /** More items, after the selections. */
  children?: ReactNode;
};

/** A "+" menu to add files to the message and pick options such as tools and skills. */
export function AddMenu({
  onAddFiles,
  accept,
  selections = [],
  labels,
  icon = <Plus />,
  disabled,
  className,
  contentClassName,
  side = "top",
  align = "start",
  children,
}: AddMenuProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {onAddFiles && (
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          hidden
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            // Lets the same file be picked again
            event.target.value = "";
            if (files.length > 0) onAddFiles(files);
          }}
          data-testid="add-menu-file-input"
        />
      )}

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger
            render={
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className={cn("text-muted-foreground", className)}
                    aria-label={text.trigger}
                    disabled={disabled}
                    data-testid="add-menu"
                  />
                }
              />
            }
          >
            {icon}
          </TooltipTrigger>
          <TooltipContent>{text.trigger}</TooltipContent>
        </Tooltip>

        <DropdownMenuContent side={side} align={align} className={cn("w-56", contentClassName)}>
          {onAddFiles && (
            <DropdownMenuItem
              onClick={() => inputRef.current?.click()}
              data-testid="add-menu-add-files"
            >
              <Paperclip />
              {text.addFiles}
            </DropdownMenuItem>
          )}

          {onAddFiles && selections.length > 0 && <DropdownMenuSeparator />}

          {selections.map((selection) => (
            <SelectionSubmenu key={selection.id} {...selection} />
          ))}

          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function SelectionSubmenu({
  id,
  label,
  icon,
  emptyLabel,
  options,
  selectedIds,
  onSelectedIdsChange,
  single = false,
}: AddMenuSelection) {
  const testId = `add-menu-${id}`;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger data-testid={testId}>
        {icon}
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
                  : selectedIds.filter((selectedId) => selectedId !== option.id),
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
