import { Button } from "@repo/ui/components/button";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const router = useRouter();
  const { canGoBack, canGoForward } = useHistoryNav();

  return (
    <header className="flex h-10 shrink-0 items-center gap-1 border-b bg-background px-2">
      <div className="flex items-center gap-1">
        <SidebarTrigger />
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
    </header>
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
