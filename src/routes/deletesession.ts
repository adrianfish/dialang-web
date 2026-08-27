import { getSessionId } from "../utils/utils.ts";
import type { Context } from "@hono";
import { Storage } from "../storage/storage.ts";

export async function deleteSession(
  c: Context,
  storage: Storage,
): Promise<Response> {

  const sessionId: string | undefined = getSessionId(c);
  if (!sessionId) {
    console.error("Failed to get session id");
		c.status(500);
		return c.html("");
  }
  storage.deleteSession(sessionId);
  return c.html("");
}
