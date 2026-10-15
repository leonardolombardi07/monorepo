import { cn } from "cn";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Markdown } from "./markdown";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/*
 * prompt-kit's Message (https://www.prompt-kit.com/docs/message), ported to
 * Base UI: `MessageAction` composes through `render` instead of Radix's
 * `asChild`, and relies on the app's `TooltipProvider`. `MessageContent` only
 * takes a string when it renders Markdown.
 */

export type MessageProps = React.ComponentProps<"div">;

function Message({ className, ...props }: MessageProps) {
  return <div className={cn("flex gap-3", className)} {...props} />;
}

export type MessageAvatarProps = {
  src: string;
  alt: string;
  fallback?: string;
  /** Milliseconds to wait for the image before showing the fallback. */
  delay?: number;
  className?: string;
};

function MessageAvatar({ src, alt, fallback, delay, className }: MessageAvatarProps) {
  return (
    <Avatar className={cn("size-8 shrink-0", className)}>
      <AvatarImage src={src} alt={alt} />
      {fallback && <AvatarFallback delay={delay}>{fallback}</AvatarFallback>}
    </Avatar>
  );
}

export type MessageContentProps = Omit<React.ComponentProps<"div">, "children"> &
  ({ markdown: true; children: string } | { markdown?: false; children?: React.ReactNode });

function MessageContent({ markdown, children, className, ...props }: MessageContentProps) {
  const classNames = cn(
    "prose whitespace-normal break-words rounded-lg bg-secondary p-2 text-foreground",
    className,
  );

  return markdown ? (
    <Markdown className={classNames} {...props}>
      {children}
    </Markdown>
  ) : (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}

export type MessageActionsProps = React.ComponentProps<"div">;

function MessageActions({ className, ...props }: MessageActionsProps) {
  return (
    <div className={cn("flex items-center gap-2 text-muted-foreground", className)} {...props} />
  );
}

export type MessageActionProps = {
  className?: string;
  tooltip: React.ReactNode;
  /** Rendered as the tooltip trigger (Base UI's `render`, Radix's `asChild`). */
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
} & Omit<React.ComponentProps<typeof Tooltip>, "children">;

function MessageAction({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}: MessageActionProps) {
  return (
    <Tooltip {...props}>
      <TooltipTrigger render={children} />
      <TooltipContent side={side} className={className}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export { Message, MessageAction, MessageActions, MessageAvatar, MessageContent };
