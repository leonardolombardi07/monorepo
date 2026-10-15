import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";
import { useNavigate, useSearch } from "@tanstack/react-router";

export const SETTINGS_TABS = ["general", "account", "appearance"] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number];

export function SettingsDialog() {
  const { settings } = useSearch({ from: "/(authenticated)" });
  const navigate = useNavigate();

  const close = () =>
    navigate({
      to: ".",
      replace: true,
      search: (prev) => ({ ...prev, settings: undefined }),
    });

  return (
    <Dialog open={!!settings} onOpenChange={(open) => !open && close()}>
      <DialogContent className="h-[95vh] w-screen">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        {/* left nav of SETTINGS_TABS + panel for the current `settings` value */}
      </DialogContent>
    </Dialog>
  );
}
