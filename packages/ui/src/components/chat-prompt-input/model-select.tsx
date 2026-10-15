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

export type ChatModelOption = { id: string; name: string; description?: string };

export type ChatModelSelectLabels = {
  /** Names the select, and stands in for the model while none is picked. */
  model: string;
  modelsSearch: string;
  noResults: string;
};

export type ChatModelSelectProps<T extends ChatModelOption> = {
  models: T[];
  /** `undefined` while the models load, which disables the select. */
  value: T | undefined;
  onValueChange: (model: T) => void;
  labels: ChatModelSelectLabels;
};

export function ChatModelSelect<T extends ChatModelOption>({
  models,
  value,
  onValueChange,
  labels,
}: ChatModelSelectProps<T>) {
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
                  className="text-muted-foreground"
                  disabled={!value}
                  // Comboboxes aren't named by their content, which is the value
                  aria-label={labels.model}
                  data-testid="prompt-input-model"
                />
              }
            />
          }
        >
          {value?.name ?? labels.model}
        </TooltipTrigger>
        <TooltipContent>{labels.model}</TooltipContent>
      </Tooltip>

      <ComboboxContent align="end" className="w-80" aria-label={labels.model}>
        <ComboboxInput showTrigger={false} placeholder={labels.modelsSearch} />
        <ComboboxEmpty>{labels.noResults}</ComboboxEmpty>
        <ComboboxList>
          {(model: T) => (
            <ComboboxItem
              key={model.id}
              value={model}
              data-testid={`prompt-input-model-${model.id}`}
            >
              <OptionText name={model.name} description={model.description} />
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
