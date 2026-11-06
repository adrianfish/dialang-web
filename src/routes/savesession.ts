import { HTTPException } from "hono/http-exception";
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
    throw new HTTPException(500, { message: "Failed to get session" });
  }

  const sessionData: DialangSession = await session.getSessionData();
  const token: string = crypto.randomUUID();
  const savedSession: SavedDialangSession = { "saveToken": token, ...sessionData };

  if (await storeSavedSession(savedSession)) {
    return c.json({ token });
  } else  {
    throw new HTTPException(500, { message: "Failed to save session" });
  }
}
