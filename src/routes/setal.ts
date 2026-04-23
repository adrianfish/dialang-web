import { getConnInfo } from '@hono/deno'
import { setSessionId } from "../utils/utils.ts";

import type { Context } from "@hono";
import type { Storage } from "../storage/storage.ts";

export async function setAl(
  c: Context,
  storage: Storage,
): Promise<Response> {
  const body = await c.req.parseBody();
  const al = body.al;

  if (!al) {
    c.status(400);
    return c.html("No admin language supplied");
  }

  const sessionId = setSessionId(c);

  storage.saveSession(sessionId, {
    id: sessionId,
    al,
    referrer: c.req.header("Referer"),
    ipAddress: getConnInfo(c).remote.address,
    started: Date.now(),
  });

  return c.json({ al, sessionId });
}
