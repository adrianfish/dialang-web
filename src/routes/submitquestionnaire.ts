import { getSessionId } from "../utils/utils.ts";
import { storeQuestionnaire } from "../data-capture/data-capture.ts";

import type { Context } from "hono";

export async function submitQuestionnaire(c: Context): Promise<Response> {

  const body = await c.req.parseBody();

	const sessionId: string | undefined = getSessionId(c);

  if (!sessionId) {
    console.warn("Failed to get sessionId");
    return c.html("");
  }

	await storeQuestionnaire(sessionId, body);

  return c.html("");
}
