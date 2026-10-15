import { z } from "zod";

export const permissionModeSchema = z.enum(["manual", "auto", "plan", "bypass"]);

/** How much the agent may do without asking. */
export type PermissionMode = z.infer<typeof permissionModeSchema>;

/** The prompt input's settings, sent with every message (see `PromptInputBody`). */
export const chatBodySchema = z.object({
  permissionMode: permissionModeSchema,
  /** OpenRouter model id, e.g. `google/gemma-4-31b-it:free`. */
  modelId: z.string(),
  reasoning: z.enum(["none", "minimal", "low", "medium", "high", "xhigh"]),
  /** Not used by the agent yet. */
  toolIds: z.array(z.string()).default([]),
  /** Not used by the agent yet (step 4 adds them to its instructions). */
  skillIds: z.array(z.string()).default([]),
});

export type ChatBody = z.infer<typeof chatBodySchema>;
