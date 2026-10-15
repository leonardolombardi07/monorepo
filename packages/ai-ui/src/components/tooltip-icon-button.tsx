import { Button } from "@repo/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import type { ComponentProps } from "react";

export type TooltipIconButtonProps = ComponentProps<typeof Button> & {
  /** Shown on hover and focus, and names the button for screen readers. */
  tooltip: string;
  side?: ComponentProps<typeof TooltipContent>["side"];
};

/**
 * An icon-only button, named by its tooltip. assistant-ui primitives render it
 * through `render`, which merges their props (`onClick`, `disabled`...) in.
 */
export function TooltipIconButton({
  tooltip,
  side = "top",
  variant = "ghost",
  size = "icon-sm",
  children,
  ...props
}: TooltipIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant={variant} size={size} aria-label={tooltip} {...props} />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side={side}>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
