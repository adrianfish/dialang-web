import { getSession as getSessionDO } from "../utils/utils.ts";
import { SessionDO } from "../session-do.ts";

import type { Context } from "hono";

export async function getSession(
  c: Context,
): Promise<Response> {

  const session: SessionDO | null = getSessionDO(c);
  if (!session) {
    console.error("Failed to get session");
		c.status(500);
		return c.json("");
  }
  return c.json(JSON.stringify(await session.getSessionData()));
}
