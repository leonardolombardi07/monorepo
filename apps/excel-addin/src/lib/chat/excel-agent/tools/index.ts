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

/** The tools that only read, so they never need approval and work in Plan mode. */
export const READ_ONLY_TOOLS: ToolName[] = ["getWorkbookOverview", "readRange"];
