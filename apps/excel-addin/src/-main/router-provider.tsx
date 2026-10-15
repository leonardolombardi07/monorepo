import {
  createMemoryHistory,
  createRouter,
  RouterProvider as TanstackRouterProvider,
} from "@tanstack/react-router";
import { useState } from "react";
// import { NotFound } from "../../components/not-found";
import { routeTree } from "../routeTree.gen";
import { queryClient } from "./query-client-provider";

function createAppRouter() {
  return createRouter({
    routeTree,
    /*
     * Memory history instead of browser/hash history: a task pane has no URL
     * bar, and Office.js replaces `history.pushState`/`replaceState` in some
     * hosts, which breaks the history-based options.
     */
    history: createMemoryHistory(),
    context: { queryClient },
    defaultPreload: "intent",
    // defaultNotFoundComponent: NotFound,
  });
}

// Types `useNavigate`, `Link`, `Route` and friends with this app's routes
declare module "@tanstack/react-router" {
  // biome-ignore lint/style/useConsistentTypeDefinitions: augmentation only merges into an interface
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
export function RouterProvider() {
  const [router] = useState(() => createAppRouter());
  return <TanstackRouterProvider router={router} />;
}
