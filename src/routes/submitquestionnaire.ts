import { getSessionId } from "../utils/utils.ts";

import type { Context } from "@hono";
import type { Storage } from "../storage/storage.ts";

export async function submitQuestionnaire(c: Context, storage: Storage): Promise<Response> {

  const body = await c.req.parseBody();

	const sessionId: string | undefined = getSessionId(c);

  if (!sessionId) {
    console.warn("Failed to get sessionId");
    return c.html("");
  }

	await storage.storeQuestionnaire(sessionId, body);

  return c.html("");
}
