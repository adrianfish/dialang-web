import { HTTPException } from "hono/http-exception";
import { getSessionId } from "../utils/utils.ts";
import { storeQuestionnaire } from "../data-capture/data-capture.ts";

import type { Context } from "hono";

export async function submitQuestionnaire(c: Context): Promise<Response> {

  const body = await c.req.parseBody();

	const sessionId: string | undefined = getSessionId(c);

  if (!sessionId) {
    throw new HTTPException(500, { message: "Failed to get sessionId" });
  }

	await storeQuestionnaire(sessionId, body);

  return c.html("");
}
