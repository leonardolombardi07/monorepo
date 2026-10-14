import { TooltipProvider as UITooltipProvider } from "@repo/ui/components/tooltip";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <UITooltipProvider>{children}</UITooltipProvider>;
}
