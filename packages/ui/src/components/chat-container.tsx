import { cn } from "cn";
import { StickToBottom } from "use-stick-to-bottom";

/*
 * prompt-kit's ChatContainer (https://www.prompt-kit.com/docs/chat-container):
 * follows new content down while the user is at the bottom, and stops when
 * they scroll up. The scrolling element is the one `ChatContainerContent`
 * renders around its children, so give the root a bounded height. The root
 * clips instead of scrolling like in the original, where anything poking out
 * of it (e.g. a hidden `ScrollButton` sliding down) added a second scrollbar.
 */

export type ChatContainerRootProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export type ChatContainerContentProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export type ChatContainerScrollAnchorProps = {
  className?: string;
  ref?: React.RefObject<HTMLDivElement>;
} & React.HTMLAttributes<HTMLDivElement>;

function ChatContainerRoot({ children, className, ...props }: ChatContainerRootProps) {
  return (
    <StickToBottom
      className={cn("flex overflow-hidden", className)}
      resize="smooth"
      initial="instant"
      role="log"
      {...props}
    >
      {children}
    </StickToBottom>
  );
}

function ChatContainerContent({ children, className, ...props }: ChatContainerContentProps) {
  return (
    <StickToBottom.Content className={cn("flex w-full flex-col", className)} {...props}>
      {children}
    </StickToBottom.Content>
  );
}

function ChatContainerScrollAnchor({ className, ...props }: ChatContainerScrollAnchorProps) {
  return (
    <div
      className={cn("h-px w-full shrink-0 scroll-mt-4", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export { ChatContainerContent, ChatContainerRoot, ChatContainerScrollAnchor };
