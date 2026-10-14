import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "./-main/query-client-provider";
import { RouterProvider } from "./-main/router-provider";
import { TooltipProvider } from "./-main/tooltip-provider";
import { waitForOffice } from "./lib/office";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

await waitForOffice();

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider>
      <TooltipProvider>
        <RouterProvider />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
);
