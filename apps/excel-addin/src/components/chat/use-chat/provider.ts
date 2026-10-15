import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/*
 * TEMPORARY: the task pane calls the model through OpenRouter itself, so the
 * API key is bundled into the add-in. Good enough to test the chat live, until
 * a backend exists. Swapping `chatTransport` for that backend's transport is
 * the main change it needs; the Excel tools stay in the pane, since only the
 * pane can reach the workbook.
 */

const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
if (!apiKey) {
  throw new Error(
    "Set VITE_OPENROUTER_API_KEY in apps/excel-addin/.env (see .env.example), then restart the dev server.",
  );
}

export const openrouter = createOpenRouter({ apiKey });
