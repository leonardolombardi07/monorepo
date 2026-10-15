import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "./button";

/*
 * prompt-kit's SystemMessage (https://www.prompt-kit.com/docs/system-message).
 * Errors use the theme's destructive color, and the call to action honors its
 * `variant`, which the original ignored.
 */

const systemMessageVariants = cva(
  "flex flex-row items-center gap-3 rounded-[12px] border py-2 pr-2 pl-3",
  {
    variants: {
      variant: {
        action: "text-zinc-700 dark:text-zinc-300",
        error: "text-destructive",
        warning: "text-amber-700 dark:text-amber-500",
      },
      fill: {
        true: "bg-background",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "action",
        fill: true,
        class: "border-transparent bg-zinc-100 dark:bg-zinc-900",
      },
      {
        variant: "error",
        fill: true,
        class: "border-transparent bg-destructive/10",
      },
      {
        variant: "warning",
        fill: true,
        class: "border-transparent bg-amber-100 dark:bg-amber-900/20",
      },
      {
        variant: "action",
        fill: false,
        class: "border-zinc-200 dark:border-zinc-800",
      },
      {
        variant: "error",
        fill: false,
        class: "border-destructive/50",
      },
      {
        variant: "warning",
        fill: false,
        class: "border-amber-600 dark:border-amber-900",
      },
    ],
    defaultVariants: {
      variant: "action",
      fill: false,
    },
  },
);

const CTA_BUTTON_VARIANTS = {
  solid: "default",
  outline: "outline",
  ghost: "ghost",
} as const;

export type SystemMessageProps = React.ComponentProps<"div"> &
  VariantProps<typeof systemMessageVariants> & {
    icon?: React.ReactNode;
    isIconHidden?: boolean;
    cta?: {
      label: string;
      onClick?: () => void;
      variant?: keyof typeof CTA_BUTTON_VARIANTS;
    };
  };

function getDefaultIcon(variant: SystemMessageProps["variant"]) {
  switch (variant) {
    case "error":
      return <AlertCircle className="size-4" />;
    case "warning":
      return <AlertTriangle className="size-4" />;
    default:
      return <Info className="size-4" />;
  }
}

function SystemMessage({
  children,
  variant = "action",
  fill = false,
  icon,
  isIconHidden = false,
  cta,
  className,
  ...props
}: SystemMessageProps) {
  const iconToShow = isIconHidden ? null : (icon ?? getDefaultIcon(variant));

  return (
    <div className={cn(systemMessageVariants({ variant, fill }), className)} {...props}>
      <div className="flex flex-1 flex-row items-center gap-3 leading-normal">
        {iconToShow && (
          <div className="flex h-[lh] shrink-0 items-center justify-center self-start" aria-hidden>
            {iconToShow}
          </div>
        )}

        <div className="flex min-w-0 flex-1 items-center">
          <div className="text-sm">{children}</div>
        </div>
      </div>

      {cta && (
        <Button
          variant={CTA_BUTTON_VARIANTS[cta.variant ?? "solid"]}
          size="sm"
          onClick={cta.onClick}
        >
          {cta.label}
        </Button>
      )}
    </div>
  );
}

export { SystemMessage };
