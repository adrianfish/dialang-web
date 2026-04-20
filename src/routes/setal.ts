import { setCookie } from "@hono/cookie";
import { getConnInfo } from '@hono/deno'
import { v5 } from "@std/uuid";

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
  const sessionId = crypto.randomUUID();

  setCookie(c, "dialang", sessionId)

  const info = getConnInfo(c)

  const started = Date.now();
  storage.saveSession(sessionId, {
    id: sessionId,
    al,
    referrer: c.req.header("Referer"),
    ipAddress: info.remote.address,
    started,
  });

  return c.json({ al, sessionId });
}
