import { getSession, getSessionId } from "../utils/utils.ts";
import { storeTestLanguageAndSkill } from "../data-capture/data-capture.ts";

import type { Context } from "hono";

export async function setTl(c: Context): Promise<Response> {

  const body = await c.req.parseBody();

  if (!body.tl || !body.skill) {
    c.status(400);
    return c.html("No test language or skill supplied");
  }


  const session: SessionDO = getSession(c);

  await session.clearTestData();

  const passId = crypto.randomUUID();
  await session.setTestLanguageAndSkill(passId, body.tl, body.skill);
  await storeTestLanguageAndSkill(passId, getSessionId(c), body.tl, body.skill);

  return c.json({ tl: body.tl, skill: body.skill });
}
