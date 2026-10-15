import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "./-route/layout";
import { SETTINGS_TABS, type SettingsTab } from "./-route/settings-dialog";

export const Route = createFileRoute("/(authenticated)")({
  validateSearch: (s: Record<string, unknown>): { settings?: SettingsTab } => ({
    settings: SETTINGS_TABS.includes(s.settings as SettingsTab)
      ? (s.settings as SettingsTab)
      : undefined,
  }),

  component: Layout,
});
