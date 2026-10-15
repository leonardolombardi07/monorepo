import { Button } from "../button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "../combobox";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { OptionText } from "./option-text";

/** How much the agent may do without asking, e.g. `{ id: "manual", name: "Manual", ... }`. */
export type ChatPermissionOption<T extends string = string> = {
  id: T;
  name: string;
  description?: string;
};

export type ChatPermissionSelectLabels = {
  /** Names the select. */
  permissions: string;
  permissionsSearch: string;
  noResults: string;
};

export type ChatPermissionSelectProps<T extends string> = {
  options: ChatPermissionOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  labels: ChatPermissionSelectLabels;
};

export function ChatPermissionSelect<T extends string>({
  options,
  value,
  onValueChange,
  labels,
}: ChatPermissionSelectProps<T>) {
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
      isItemEqualToValue={(item, selectedItem) => item.id === selectedItem.id}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <ComboboxTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  // Comboboxes aren't named by their content, which is the value
                  aria-label={labels.permissions}
                  data-testid="prompt-input-permissions"
                />
              }
            />
          }
        >
          {selected?.name}
        </TooltipTrigger>
        <TooltipContent>{labels.permissions}</TooltipContent>
      </Tooltip>

      <ComboboxContent className="w-80" aria-label={labels.permissions}>
        <ComboboxInput showTrigger={false} placeholder={labels.permissionsSearch} />
        <ComboboxEmpty>{labels.noResults}</ComboboxEmpty>
        <ComboboxList>
          {(option: ChatPermissionOption<T>) => (
            <ComboboxItem
              key={option.id}
              value={option}
              data-testid={`prompt-input-permission-${option.id}`}
            >
              <OptionText name={option.name} description={option.description} />
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
