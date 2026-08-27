import { getSessionId } from "../utils/utils.ts";

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

  const sessionId: string | undefined = getSessionId(c);
  if (!sessionId) {
    console.error("Failed to get session id");
		c.status(500);
		return c.html("");
  }

  const session: DialangSession | null = await storage.getSession(sessionId);
  if (!session) {
		console.error(`No session for id ${sessionId}. Returning 500 ...`)
		c.status(500);
		return c.html("");
  }

  // Reset stuff. Maybe move this into a utils module. Delete the props or they will be stored. No
  // point storing them unless they have a value
  delete session.vsptSubmitted;
  delete session.vsptMearaScore;
  delete session.vsptZScore;
  delete session.vsptLevel;
  delete session.saSubmitted;
  delete session.saPPE;
  delete session.saLevel;
  delete session.saDone;
  delete session.bookletId;
  delete session.bookletLength;
  delete session.currentBasketId;
  delete session.currentBasketNumber;
  delete session.scoredItems;
  delete session.itemRawScore;
  delete session.itemGrade;
  delete session.itemLevel;

  session.tl = body.tl as string;
  session.skill = body.skill as string;
  storage.saveSession(sessionId, session);

  storage.logTestStart(session);

  return c.json({ tl: body.tl, skill: body.skill });
}
