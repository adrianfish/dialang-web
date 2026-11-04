import { getSession } from "../utils/utils.ts";
import { storeSavedSession } from "../data-capture/data-capture.ts";
import { SessionDO } from "../session-do.ts";

import type { Context } from "hono";
import type { DialangSession, SavedDialangSession } from "../types.ts";

export async function saveSession(
  c: Context,
): Promise<Response> {

  const session: SessionDO | null = getSession(c);
  if (!session) {
		console.error("Failed to get session id");
		c.status(500);
		return c.html("");
  }

  const sessionData: DialangSession = await session.getSessionData();
  const token: string = crypto.randomUUID();
  const savedSession: SavedDialangSession = { "saveToken": token, ...sessionData };

  if (await storeSavedSession(savedSession)) {
    return c.json({ token });
  } else  {
		console.error("Failed to save session");
		c.status(500);
		return c.html("");
  }
}
