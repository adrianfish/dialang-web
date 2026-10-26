import { getSession, getSessionId } from "../utils/utils.ts";

import type { Storage } from "../storage/storage.ts";
import type { Context } from "@hono";
import type { DialangSession } from "../types.ts";

export async function setTl(
  c: Context,
  storage: Storage,
): Promise<Response> {
  const body = await c.req.parseBody();

  if (!body.tl || !body.skill) {
    c.status(400);
    return c.html("No test language or skill supplied");
  }

  const sessionId = getSessionId(c);
  const session: SessionDO = getSession(c);
  await session.setTestLanguageAndSkill(body.tl, body.skill);

  return c.json({ tl: body.tl, skill: body.skill });
}
