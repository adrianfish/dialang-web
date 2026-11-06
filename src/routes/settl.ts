import { HTTPException } from "hono/http-exception";
import { getSession, getSessionId } from "../utils/utils.ts";
import { storeTestLanguageAndSkill } from "../data-capture/data-capture.ts";
import { SessionDO } from "../session-do.ts";

import type { Context } from "hono";

export async function setTl(c: Context): Promise<Response> {

  const body = await c.req.parseBody();

  if (!body.tl || !body.skill) {
    throw new HTTPException(400, { message: "No test language or skill supplied" });
  }

  const session: SessionDO | null = getSession(c);
  if (!session) {
    throw new HTTPException(500, { message: "No current session" });
  }

  await session.clearTestData();

  const passId = crypto.randomUUID();
  await session.setTestLanguageAndSkill(passId, body.tl as string, body.skill as string);
  await storeTestLanguageAndSkill(passId, getSessionId(c) as string, body.tl as string, body.skill as string);

  return c.json({ tl: body.tl, skill: body.skill });
}
