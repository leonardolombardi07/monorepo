import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "./-main/query-client-provider";
import { RouterProvider } from "./-main/router-provider";
import { TooltipProvider } from "./-main/tooltip-provider";
import { getLocale } from "./lib/internationalization";
import { waitForOffice } from "./lib/office";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

await waitForOffice();
// After Office is ready, as the locale can come from its display language
document.documentElement.lang = getLocale();

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider>
      <TooltipProvider>
        <RouterProvider />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
);
