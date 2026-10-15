import { Slider } from "@base-ui/react/slider";
import { Button } from "@repo/ui/components/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@repo/ui/components/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { cn } from "cn";
import { CircleQuestionMark } from "lucide-react";
import type { ComponentProps } from "react";

/** One stop on the slider, e.g. `{ value: "medium", label: "Medium" }`. */
export type EffortLevel<T extends string = string> = {
  value: T;
  label: string;
};

export type EffortSelectLabels = {
  /** Names the control, and titles its popover. */
  title: string;
  /** Under the slider's low end. */
  faster: string;
  /** Under the slider's high end. */
  smarter: string;
  /** Under the recommended level's mark. */
  recommended: string;
  /** Names the help button. */
  about: string;
  /** Explains effort in the help button's tooltip. Without it, there is no help button. */
  help?: string;
};

const DEFAULT_LABELS: EffortSelectLabels = {
  title: "Effort",
  faster: "Faster",
  smarter: "Smarter",
  recommended: "Recommended",
  about: "About effort",
};

type ContentProps = ComponentProps<typeof PopoverContent>;

export type EffortSelectProps<T extends string> = {
  /** From least to most effort. */
  levels: readonly EffortLevel<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Marked on the slider. */
  recommended?: T;
  labels?: Partial<EffortSelectLabels>;
  disabled?: boolean;
  /** Classes for the trigger. */
  className?: string;
  contentClassName?: string;
  side?: ContentProps["side"];
  align?: ContentProps["align"];
};

/** How hard the model thinks before answering, picked on a slider. */
export function EffortSelect<T extends string>({
  levels,
  value,
  onValueChange,
  recommended,
  labels,
  disabled,
  className,
  contentClassName,
  side = "top",
  align = "end",
}: EffortSelectProps<T>) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const current = levels.find((level) => level.value === value);

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
                  className={cn("text-muted-foreground", className)}
                  disabled={disabled}
                  data-testid="effort-select"
                />
              }
            />
          }
        >
          <span className="sr-only">{text.title}: </span>
          {current?.label}
        </TooltipTrigger>
        <TooltipContent>{text.title}</TooltipContent>
      </Tooltip>

      <PopoverContent
        side={side}
        align={align}
        className={cn("w-80 gap-3 p-4", contentClassName)}
      >
        <div className="flex items-center gap-2">
          <PopoverTitle className="font-normal text-muted-foreground">{text.title}</PopoverTitle>
          <span className="font-medium">{current?.label}</span>
          {text.help && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="ml-auto text-muted-foreground"
                    aria-label={text.about}
                  />
                }
              >
                <CircleQuestionMark />
              </TooltipTrigger>
              <TooltipContent className="max-w-60">{text.help}</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex justify-between text-muted-foreground text-xs">
          <span>{text.faster}</span>
          <span>{text.smarter}</span>
        </div>

        <EffortSlider
          levels={levels}
          value={value}
          onValueChange={onValueChange}
          recommended={recommended}
          title={text.title}
          recommendedLabel={text.recommended}
        />
      </PopoverContent>
    </Popover>
  );
}

type EffortSliderProps<T extends string> = Pick<
  EffortSelectProps<T>,
  "levels" | "value" | "onValueChange" | "recommended"
> & {
  title: string;
  recommendedLabel: string;
};

function EffortSlider<T extends string>({
  levels,
  value,
  onValueChange,
  recommended,
  title,
  recommendedLabel,
}: EffortSliderProps<T>) {
  const lastIndex = Math.max(levels.length - 1, 1);

  /** Where a level sits along the track, as a CSS percentage. */
  function getStopPosition(index: number) {
    return `${(index / lastIndex) * 100}%`;
  }

  const recommendedIndex = levels.findIndex((level) => level.value === recommended);

  return (
    <div className="flex flex-col gap-1.5">
      <Slider.Root
        value={levels.findIndex((level) => level.value === value)}
        onValueChange={(index) => {
          const level = levels[index];
          if (level) onValueChange(level.value);
        }}
        min={0}
        max={levels.length - 1}
        step={1}
        // Keeps the thumb inside the rounded track at both ends
        thumbAlignment="edge"
        data-testid="effort-select-slider"
      >
        <Slider.Control className="flex w-full touch-none select-none items-center">
          <Slider.Track className="relative h-8 w-full rounded-full bg-muted">
            <Slider.Indicator className="h-full rounded-full bg-foreground/5" />
            {/* Inset by half the thumb so stops line up with its center */}
            <div className="pointer-events-none absolute inset-y-0 right-4 left-4">
              {levels.map((level, index) => (
                <span
                  key={level.value}
                  className={cn(
                    "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/60",
                    index === recommendedIndex ? "h-3 w-0.5" : "size-1",
                  )}
                  style={{ left: getStopPosition(index) }}
                />
              ))}
            </div>
            <Slider.Thumb
              aria-label={title}
              getAriaValueText={(_formatted, index) => levels[index]?.label ?? ""}
              className="h-7 w-8 rounded-full bg-white shadow-sm outline-none ring-1 ring-black/10 focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>

      {recommendedIndex !== -1 && (
        // Inset like the stops so the label sits under its mark
        <div className="relative mx-4 h-4">
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap text-muted-foreground text-xs"
            style={{ left: getStopPosition(recommendedIndex) }}
          >
            {recommendedLabel}
          </span>
        </div>
      )}
    </div>
  );
}
