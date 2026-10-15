import { Button } from "@repo/ui/components/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@repo/ui/components/combobox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { cn } from "cn";
import type { ComponentProps } from "react";
import { OptionText } from "./option-text";

/** A permission mode, e.g. `{ id: "manual", name: "Manual", description: "Ask before every change" }`. */
export type PermissionOption<T extends string = string> = {
  id: T;
  name: string;
  description?: string;
};

export type PermissionSelectLabels = {
  /** Names the control. */
  title: string;
  search: string;
  empty: string;
};

const DEFAULT_LABELS: PermissionSelectLabels = {
  title: "Permissions",
  search: "Search permission modes",
  empty: "No results found",
};

type ContentProps = ComponentProps<typeof ComboboxContent>;

export type PermissionSelectProps<T extends string> = {
  options: PermissionOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  labels?: Partial<PermissionSelectLabels>;
  disabled?: boolean;
  /** Classes for the trigger. */
  className?: string;
  contentClassName?: string;
  side?: ContentProps["side"];
  align?: ContentProps["align"];
};

/** Picks how much the agent may do without asking, from a searchable list. */
export function PermissionSelect<T extends string>({
  options,
  value,
  onValueChange,
  labels,
  disabled,
  className,
  contentClassName,
  side = "top",
  align = "start",
}: PermissionSelectProps<T>) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const selected = options.find((option) => option.id === value);

  return (
    <Combobox
      items={options}
      value={selected ?? null}
      onValueChange={(option) => {
        if (option) onValueChange(option.id);
      }}
      itemToStringLabel={(option) => option.name}
      itemToStringValue={(option) => option.id}
      isItemEqualToValue={(item, current) => item.id === current.id}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <ComboboxTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("text-muted-foreground", className)}
                  disabled={disabled}
                  // Comboboxes aren't named by their content, which is the value
                  aria-label={text.title}
                  data-testid="permission-select"
                />
              }
            />
          }
        >
          {/* `ComboboxTrigger` adds the chevron */}
          {selected?.name ?? text.title}
        </TooltipTrigger>
        <TooltipContent>{text.title}</TooltipContent>
      </Tooltip>

      <ComboboxContent
        side={side}
        align={align}
        className={cn("w-80", contentClassName)}
        aria-label={text.title}
      >
        <ComboboxInput showTrigger={false} placeholder={text.search} />
        <ComboboxEmpty>{text.empty}</ComboboxEmpty>
        <ComboboxList>
          {(option: PermissionOption<T>) => (
            <ComboboxItem
              key={option.id}
              value={option}
              data-testid={`permission-select-${option.id}`}
            >
              <OptionText name={option.name} description={option.description} />
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
