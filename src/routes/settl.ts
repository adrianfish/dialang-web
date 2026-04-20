import { getCookie, setCookie } from "@hono/cookie";
import { getConnInfo } from '@hono/deno'
import { v5 } from "@std/uuid";
import type { Context } from "@hono";
import type { DialangSession, TES } from "../types/types.ts";
import { Storage } from "../storage/storage.ts";

export async function setTl(
  c: Context,
  storage: Storage,
): Promise<Response> {
  const body = await c.req.parseBody();

  if (!body.tl || !body.skill) {
    c.status(400);
    return c.html("No test language or skill supplied");
  }

  const sessionId: string = getCookie(c, "dialang");

  const session = await storage.getSession(sessionId);

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

  session.tl = body.tl;
  session.skill = body.skill;
  storage.saveSession(sessionId, session);

  return c.json({ tl: body.tl, skill: body.skill });
}
