import { getConnInfo } from 'hono/cloudflare-workers'
import { getSession, getSessionFromId, setSessionId } from "../utils/utils.ts";

import type { Context } from "hono";
import type { ALData } from "../types.ts";

export async function setAl(c: Context): Promise<Response> {

  const body = await c.req.parseBody();

  const al = body.al as string;

  if (!al) {
    c.status(400);
    return c.html("No admin language supplied");
  }

  const ipAddress = (getConnInfo(c).remote.address || "").replace(/^::ffff:/, "");

  const sessionId = setSessionId(c);

  const alData: ALData = {
    sessionId,
    al,
    referrer: c.req.header("Referer") || "",
    ipAddress,
    started: Date.now(),
  };

  await getSessionFromId(c, sessionId).setAdminLanguage(alData);

  return c.json({ al, sessionId });
}
