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

export type ModelOption = {
  id: string;
  name: string;
  description?: string;
};

export type ModelSelectLabels = {
  /** Names the control; also the trigger's text while no model is picked. */
  title: string;
  search: string;
  empty: string;
};

const DEFAULT_LABELS: ModelSelectLabels = {
  title: "Model",
  search: "Search models",
  empty: "No results found",
};

type ContentProps = ComponentProps<typeof ComboboxContent>;

export type ModelSelectProps<T extends ModelOption> = {
  models: T[];
  /** `undefined` while the models load, which disables the control. */
  value: T | undefined;
  onValueChange: (model: T) => void;
  labels?: Partial<ModelSelectLabels>;
  disabled?: boolean;
  /** Classes for the trigger. */
  className?: string;
  contentClassName?: string;
  side?: ContentProps["side"];
  align?: ContentProps["align"];
};

/** Picks the model that answers, from a searchable list. */
export function ModelSelect<T extends ModelOption>({
  models,
  value,
  onValueChange,
  labels,
  disabled,
  className,
  contentClassName,
  side = "top",
  align = "end",
}: ModelSelectProps<T>) {
  const text = { ...DEFAULT_LABELS, ...labels };

  return (
    <Combobox
      items={models}
      value={value ?? null}
      onValueChange={(model) => {
        if (model) onValueChange(model);
      }}
      itemToStringLabel={(model) => model.name}
      itemToStringValue={(model) => model.id}
      isItemEqualToValue={(item, selected) => item.id === selected.id}
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
                  disabled={disabled || !value}
                  // Comboboxes aren't named by their content, which is the value
                  aria-label={text.title}
                  data-testid="model-select"
                />
              }
            />
          }
        >
          {/* `ComboboxTrigger` adds the chevron */}
          {value?.name ?? text.title}
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
          {(model: T) => (
            <ComboboxItem key={model.id} value={model} data-testid={`model-select-${model.id}`}>
              <OptionText name={model.name} description={model.description} />
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
