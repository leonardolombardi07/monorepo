import { Button } from "@repo/ui/components/button";
import { SidebarContent, SidebarTrigger, Sidebar as UISidebar } from "@repo/ui/components/sidebar";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Chats, PinnedChats } from "./chats";
import { Footer } from "./footer";
import { NavigationMenu } from "./navigation-menu";

export function Sidebar() {
  return (
    <UISidebar>
      <Header />
      <SidebarContent>
        <NavigationMenu />
        <PinnedChats />
        <Chats />
      </SidebarContent>

      <Footer />
    </UISidebar>
  );
}

function Header() {
  const router = useRouter();
  const { canGoBack, canGoForward } = useHistoryNav();

  return (
    <div className="flex h-10 items-center border-b px-2">
      <SidebarTrigger />

      <h1>Cowork</h1>

      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        disabled={!canGoBack}
        onClick={() => router.history.back()}
      >
        <ArrowLeft />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        disabled={!canGoForward}
        onClick={() => router.history.forward()}
      >
        <ArrowRight />
      </Button>
    </div>
  );
}

function useHistoryNav() {
  const router = useRouter();

  const [nav, setNav] = useState(() => {
    const index = router.history.location.state.__TSR_index;
    return { index, max: index };
  });

  useEffect(() => {
    return router.history.subscribe(({ location, action }) => {
      const index = location.state.__TSR_index;
      setNav((prev) => ({
        index,
        max: action.type === "PUSH" ? index : Math.max(prev.max, index),
      }));
    });
  }, [router]);

  return {
    canGoBack: nav.index > 0,
    canGoForward: nav.index < nav.max,
  };
}
