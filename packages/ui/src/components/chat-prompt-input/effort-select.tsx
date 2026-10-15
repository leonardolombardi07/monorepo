import { Slider } from "@base-ui/react/slider";
import { cn } from "cn";
import { CircleQuestionMark } from "lucide-react";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

/** A stop on the slider, e.g. `{ value: "medium", label: "Medium" }`. */
export type ChatEffortOption<T extends string = string> = { value: T; label: string };

export type ChatEffortSelectLabels = {
  /** Names the select and the slider. */
  effort: string;
  /** Names the help button. */
  effortAbout: string;
  /** What effort means, in the help button's tooltip. */
  effortHelp: string;
  /** Under the start of the slider. */
  effortFaster: string;
  /** Under the end of the slider. */
  effortSmarter: string;
  /** Under the recommended stop. */
  effortRecommended: string;
};

export type ChatEffortSelectProps<T extends string> = {
  /** From least to most reasoning, e.g. the AI SDK's `reasoning` levels. */
  options: readonly ChatEffortOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Marked on the slider, with `labels.effortRecommended` under it. */
  recommended?: T;
  labels: ChatEffortSelectLabels;
};

/** How much the model reasons before answering, on a slider in a popover. */
export function ChatEffortSelect<T extends string>({
  options,
  value,
  onValueChange,
  recommended,
  labels,
}: ChatEffortSelectProps<T>) {
  const label = options.find((option) => option.value === value)?.label ?? value;

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  data-testid="prompt-input-effort"
                />
              }
            />
          }
        >
          <span className="sr-only">{labels.effort}: </span>
          {label}
        </TooltipTrigger>
        <TooltipContent>{labels.effort}</TooltipContent>
      </Tooltip>

      <PopoverContent align="end" className="w-80 gap-3 p-4">
        <div className="flex items-center gap-2">
          <PopoverTitle className="font-normal text-muted-foreground">{labels.effort}</PopoverTitle>
          <span className="font-medium">{label}</span>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="ml-auto text-muted-foreground"
                  aria-label={labels.effortAbout}
                />
              }
            >
              <CircleQuestionMark />
            </TooltipTrigger>
            <TooltipContent className="max-w-60">{labels.effortHelp}</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex justify-between text-muted-foreground text-xs">
          <span>{labels.effortFaster}</span>
          <span>{labels.effortSmarter}</span>
        </div>

        <EffortSlider
          options={options}
          value={value}
          onValueChange={onValueChange}
          recommended={recommended}
          labels={labels}
        />
      </PopoverContent>
    </Popover>
  );
}

function EffortSlider<T extends string>({
  options,
  value,
  onValueChange,
  recommended,
  labels,
}: ChatEffortSelectProps<T>) {
  const lastIndex = Math.max(options.length - 1, 1);
  const recommendedIndex = options.findIndex((option) => option.value === recommended);

  /** Where a stop sits along the track, as a CSS percentage. */
  function getStopPosition(index: number) {
    return `${(index / lastIndex) * 100}%`;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Slider.Root
        value={Math.max(
          options.findIndex((option) => option.value === value),
          0,
        )}
        onValueChange={(index) => {
          const option = options[index];
          if (option) onValueChange(option.value);
        }}
        min={0}
        max={lastIndex}
        step={1}
        // Keeps the thumb inside the rounded track at both ends
        thumbAlignment="edge"
        data-testid="prompt-input-effort-slider"
      >
        <Slider.Control className="flex w-full touch-none select-none items-center">
          <Slider.Track className="relative h-8 w-full rounded-full bg-muted">
            <Slider.Indicator className="h-full rounded-full bg-foreground/5" />
            {/* Inset by half the thumb so stops line up with its center */}
            <div className="pointer-events-none absolute inset-y-0 right-4 left-4">
              {options.map((option, index) => (
                <span
                  key={option.value}
                  className={cn(
                    "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/60",
                    index === recommendedIndex ? "h-3 w-0.5" : "size-1",
                  )}
                  style={{ left: getStopPosition(index) }}
                />
              ))}
            </div>
            <Slider.Thumb
              aria-label={labels.effort}
              getAriaValueText={(_formatted, index) => options[index]?.label ?? ""}
              className="h-7 w-8 rounded-full bg-white shadow-sm outline-none ring-1 ring-black/10 focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>

      {recommendedIndex >= 0 && (
        // Inset like the stops so the label sits under its mark
        <div className="relative mx-4 h-4">
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap text-muted-foreground text-xs"
            style={{ left: getStopPosition(recommendedIndex) }}
          >
            {labels.effortRecommended}
          </span>
        </div>
      )}
    </div>
  );
}
