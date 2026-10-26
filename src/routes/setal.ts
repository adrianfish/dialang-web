import { getConnInfo } from 'hono/cloudflare-workers'
import { getSession, getSessionFromId, setSessionId } from "../utils/utils.ts";
import { SessionDO } from "../session-do.ts";

import type { Context } from "hono";
import type { Storage } from "../storage/storage.ts";
import type { ALData } from "../types.ts";

export async function setAl(
  c: Context,
  storage: Storage,
): Promise<Response> {

  const body = await c.req.parseBody();

  const al = body.al as string;

  if (!al) {
    c.status(400);
    return c.html("No admin language supplied");
  }

  const sessionId = setSessionId(c);
  const ipAddress = (getConnInfo(c).remote.address || "").replace(/^::ffff:/, "");

  const session: SessionDO = getSessionFromId(c, sessionId);

  const alData: ALData = {
    sessionId,
    al,
    referrer: c.req.header("Referer") || "",
    ipAddress,
    started: Date.now(),
  };

  session.setAdminLanguage(alData);

  return c.json({ al, sessionId });
}
