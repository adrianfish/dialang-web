import { getSessionId } from "../utils/utils.ts";
import { Storage } from "../storage/storage.ts";

import type { Context } from "hono";

export async function getSession(
  c: Context,
  storage: Storage,
): Promise<Response> {

  const sessionId: string | undefined = getSessionId(c);
  if (!sessionId) {
    console.error("Failed to get session id");
		c.status(500);
		return c.json("");
  }
  return c.json(await storage.getSession(sessionId));
}
