import { cn } from "cn";

/*
 * prompt-kit's Loader (https://www.prompt-kit.com/docs/loader), trimmed to the
 * variants the app uses: port others from there when needed. The keyframes
 * live in `assets/main.css`. Loaders are decorative, so give them an
 * accessible label where they're used.
 */

type LoaderSize = "sm" | "md" | "lg";

const TYPING_DOT_SIZES: Record<LoaderSize, string> = {
  sm: "size-1",
  md: "size-1.5",
  lg: "size-2",
};

const TYPING_CONTAINER_SIZES: Record<LoaderSize, string> = {
  sm: "h-4",
  md: "h-5",
  lg: "h-6",
};

function TypingLoader({ className, size = "md" }: { className?: string; size?: LoaderSize }) {
  return (
    <div
      className={cn("flex items-center gap-1", TYPING_CONTAINER_SIZES[size], className)}
      aria-hidden
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            "animate-[typing_1s_infinite] rounded-full bg-primary motion-reduce:animate-none",
            TYPING_DOT_SIZES[size],
          )}
          style={{ animationDelay: `${index * 250}ms` }}
        />
      ))}
    </div>
  );
}

export { TypingLoader };
