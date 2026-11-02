import { getSession } from "../utils/utils.ts";
import { Storage } from "../storage/storage.ts";

import type { Context } from "hono";

export async function getSession(
  c: Context,
  storage: Storage,
): Promise<Response> {

  const session: SessionDO = getSession(c);
  if (!session) {
    console.error("Failed to get session");
		c.status(500);
		return c.json("");
  }
  return c.json(await storage.getSession(sessionId));
}
