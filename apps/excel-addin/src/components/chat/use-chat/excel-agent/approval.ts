import type { ToolApprovalStatus } from "ai";
import type { PermissionMode } from "../types";
import { countOverwrittenCells, type WriteRangeInput } from "./tools";

/*
 * When a tool needs the user's OK. A tool marked 'user-approval' doesn't run:
 * the response ends with an approval request, the chat shows it, and the
 * user's answer resumes the agent (`sendAutomaticallyWhen` in the chat store).
 * A function decides per call, from the tool's input.
 *
 * Writes matter because Excel often can't undo what an add-in changed.
 */

/** Auto mode: writing into empty cells is fine, replacing data asks first. */
async function askBeforeOverwriting(input: WriteRangeInput): Promise<ToolApprovalStatus> {
  const { count, address } = await countOverwrittenCells(input);
  if (count === 0) return "not-applicable";
  return {
    type: "user-approval",
    // Shown to the user with the request
    reason: `Replaces ${count} ${count === 1 ? "cell" : "cells"} with data in ${address}.`,
  };
}

export function getToolApproval(permissionMode: PermissionMode) {
  switch (permissionMode) {
    case "manual":
      return {
        writeRange: "user-approval" as const,
        formatRange: "user-approval" as const,
      };
    case "auto":
      return { writeRange: askBeforeOverwriting };
    // Plan mode has no write tools to approve (see `activeTools`)
    case "plan":
    case "bypass":
      return {};
  }
}
