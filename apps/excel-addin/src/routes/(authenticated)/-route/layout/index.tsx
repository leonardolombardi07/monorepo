import { SidebarInset, SidebarProvider, useSidebar } from "@repo/ui/components/sidebar";
import { Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { SettingsDialog } from "../settings-dialog";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

/*
 * Plain shadcn sidebar layout (no resizable panels, unlike desktop): a task
 * pane is narrower than the sidebar's 768px breakpoint, so the sidebar renders
 * as a drawer over the content. If the pane is widened past it, it becomes a
 * regular collapsible sidebar again.
 */
export function Layout() {
  return (
    <>
      <SidebarProvider className="h-svh">
        <CloseDrawerOnNavigation />
        <Sidebar />
        <SidebarInset className="min-w-0 overflow-hidden">
          <Header />
          <div className="min-h-0 flex-1 overflow-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>

      <SettingsDialog />
    </>
  );
}

/** Picking a chat or page in the drawer should show it, not leave the drawer covering it. */
function CloseDrawerOnNavigation() {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  useEffect(
    () =>
      router.subscribe("onResolved", () => {
        setOpenMobile(false);
      }),
    [router, setOpenMobile],
  );

  return null;
}
