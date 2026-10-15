import { m } from "@/lib/internationalization";
import { formatRange } from "./format-range";
import { getWorkbookOverview } from "./get-workbook-overview";
import { readRange } from "./read-range";
import { writeRange } from "./write-range";

export { READ_RANGE_MAX_CELLS } from "./read-range";
export {
  countOverwrittenCells,
  WRITE_RANGE_MAX_CELLS,
  type WriteRangeInput,
} from "./write-range";

/**
 * Every tool the agent has. The keys are the names the model calls them by,
 * and how the chat shows them.
 */
export const tools = {
  getWorkbookOverview,
  readRange,
  writeRange,
  formatRange,
};

export type ToolName = keyof typeof tools;

/**
 * What the chat calls each tool, in the user's language. Every tool needs one.
 * (The SDK's `title` on `tool()` is deprecated, and couldn't be translated.)
 */
const TOOL_TITLES: Record<ToolName, () => string> = {
  getWorkbookOverview: m.tool_title_get_workbook_overview,
  readRange: m.tool_title_read_range,
  writeRange: m.tool_title_write_range,
  formatRange: m.tool_title_format_range,
};

/** The title of a tool the chat shows, or `undefined` for a tool this agent doesn't have. */
export function getToolTitle(toolName: string): string | undefined {
  return Object.hasOwn(TOOL_TITLES, toolName) ? TOOL_TITLES[toolName as ToolName]() : undefined;
}

/** The tools that only read, so they never need approval and work in Plan mode. */
export const READ_ONLY_TOOLS: ToolName[] = ["getWorkbookOverview", "readRange"];
