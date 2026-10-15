/** The name and description of an option in the composer's menus. */
export function OptionText({ name, description }: { name: string; description?: string }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span>{name}</span>
      {description && <span className="text-muted-foreground text-xs">{description}</span>}
    </span>
  );
}
