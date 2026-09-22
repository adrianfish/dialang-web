import { Context } from "@hono/hono";
import { getSessionId } from "../utils/utils.ts";
import { Storage } from "../storage/storage.ts";
import type { DialangSession, SavedDialangSession } from "../types.ts";

export async function saveSession(
  c: Context,
  storage: Storage,
): Promise<Response> {

  const sessionId: string | undefined = getSessionId(c);
  if (!sessionId) {
		console.error("Failed to get session id");
		c.status(500);
		return c.html("");
  }

  const session: DialangSession | null = await storage.getSession(sessionId);

  if (!session) {
		console.error(`No session for id ${sessionId}`);
		c.status(500);
		return c.json({});
  }

  const token: string = crypto.randomUUID();
  const savedSession: SavedDialangSession = { "saveToken": token, ...session };

  if (await storage.saveSavedSession(savedSession)) {
    return c.json({ token });
  } else  {
		console.error("Failed to save session");
		c.status(500);
		return c.html("");
  }
}
