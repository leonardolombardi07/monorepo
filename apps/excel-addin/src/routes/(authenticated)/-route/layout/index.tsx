import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@repo/ui/components/sidebar";
import { cn } from "@repo/ui/lib/utils";
import { Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { SettingsDialog } from "../settings-dialog";
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
        <CloseSidebarOnNavigation />
        <Sidebar />
        <SidebarInset className="min-w-0 overflow-hidden">
          <FloatingSidebarTrigger />
          <Content />
        </SidebarInset>
      </SidebarProvider>

      <SettingsDialog />
    </>
  );
}

/**
 * Leaves room for the floating trigger. In the narrow pane the drawer opens over
 * the content, so the padding stays on rather than shifting the page behind it.
 */
function Content() {
  const { isMobile, open } = useSidebar();
  const needsRoom = isMobile || !open;

  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-auto transition-[padding] duration-200 ease-linear",
        needsRoom && "pt-11",
      )}
    >
      <Outlet />
    </div>
  );
}

/** Floats over the content only while the sidebar (or the drawer, in a narrow pane) is closed. */
function FloatingSidebarTrigger() {
  if (useIsSidebarOpen()) return null;

  return <SidebarTrigger className="fixed top-2 left-2 z-[5]" />;
}

/** Desktop width uses `open`; the narrow task pane's drawer uses `openMobile`. */
function useIsSidebarOpen() {
  const { isMobile, open, openMobile } = useSidebar();
  return isMobile ? openMobile : open;
}

/** Picking a chat or page in the drawer should show it, not leave the drawer covering it. */
function CloseSidebarOnNavigation() {
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
