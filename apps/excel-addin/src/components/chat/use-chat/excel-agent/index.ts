import { isStepCount, type LanguageModel, ToolLoopAgent } from "ai";
import type { PermissionMode } from "../types";
import { getToolApproval } from "./approval";
import { getInstructions } from "./instructions";
import { READ_ONLY_TOOLS, tools } from "./tools";

export { getToolTitle } from "./tools";

/*
 * The Excel agent. This file is the folder's public API: the rest of the app
 * imports only what is exported here, so everything else in the folder can
 * change freely, and a new agent can start as a copy of this folder.
 */

/** What a chat passes in to run the agent. */
export type ExcelAgentOptions = {
  model: LanguageModel;
  permissionMode: PermissionMode;
};

/**
 * An AI SDK agent is a model, instructions (the system prompt) and tools.
 * `ToolLoopAgent` runs the loop: call the model, run the tools it asks for,
 * send it the results, and repeat until it answers without calling a tool.
 */
export function createExcelAgent({ model, permissionMode }: ExcelAgentOptions) {
  return new ToolLoopAgent({
    model,
    instructions: getInstructions({ permissionMode }),
    tools,
    /*
     * Every tool stays defined, so past messages that used one still make
     * sense to the model; `activeTools` is what it may call now.
     */
    activeTools: permissionMode === "plan" ? READ_ONLY_TOOLS : undefined,
    toolApproval: getToolApproval(permissionMode),
    // Safety net: stops a model that keeps calling tools without finishing
    stopWhen: isStepCount(25),
  });
}
