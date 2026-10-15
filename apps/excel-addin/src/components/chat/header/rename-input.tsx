import { Input } from "@repo/ui/components/input";
import { cn } from "cn";
import { useRef, useState } from "react";
import { m } from "@/lib/internationalization";

/**
 * Edits a chat's title in place. Enter or leaving the field saves; Escape
 * cancels. `onDone` gets `null` when nothing changed, or the title is empty.
 */
export function RenameInput({
  ref,
  title,
  onDone,
  className,
}: {
  ref?: React.Ref<HTMLInputElement>;
  title: string;
  onDone: (title: string | null) => void;
  className?: string;
}) {
  const [value, setValue] = useState(title);
  // Escape blurs the field too, which must not save
  const cancelled = useRef(false);

  return (
    <Input
      ref={ref}
      autoFocus
      aria-label={m.chat_rename_label()}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onFocus={(e) => e.target.select()}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          cancelled.current = true;
          e.currentTarget.blur();
        }
      }}
      onBlur={() => {
        const next = value.trim();
        onDone(cancelled.current || !next || next === title ? null : next);
      }}
      className={cn("h-8", className)}
    />
  );
}
