import { getSession } from "../utils/utils.ts";

import type { Context } from "hono";

export async function setTl(c: Context): Promise<Response> {

  const body = await c.req.parseBody();

  if (!body.tl || !body.skill) {
    c.status(400);
    return c.html("No test language or skill supplied");
  }

  await getSession(c).setTestLanguageAndSkill(body.tl, body.skill);

  return c.json({ tl: body.tl, skill: body.skill });
}
