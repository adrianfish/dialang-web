import { Context } from "@hono/hono";
import { Storage } from "../storage/storage.ts";
import { forceSessionId } from "../utils/utils.ts";

import type { SavedDialangSession } from "../types.ts";

export async function resumeSession(
  c: Context,
  storage: Storage,
): Promise<Response> {

  const { token } = await c.req.parseBody();

  const session: SavedDialangSession | null = await storage.getSavedSession(token as string);

  if (!session) {
		console.error(`No session for token ${token}`);
		c.status(500);
		return c.json({});
  }

  if (!session.currentBasketId || !session.bookletId) {
		console.error(`currentBasketId and bookletId must be set on session for token ${token}`);
		c.status(500);
		return c.json({});
  }

  // Save the saved session as a "current" session
  await storage.saveSession(session.id, session);

  // Set the saved session id in the session cookie so the client picks it up.
  forceSessionId(c, session.id);

  const clientSession = {
    id: session.id,
    al: session.al,
    tl: session.tl,
    skill: session.skill,
    vsptSubmitted: session.vsptSubmitted,
    saSubmitted: session.saSubmitted,
    saLevel: session.saLevel,
    vsptLevel: session.vsptLevel,
    vsptMearaScore: session.vsptMearaScore,
    scoredBaskets: session.scoredBaskets,
    currentBasketId: session.currentBasketId,
  };

  // Delete the saved session. It has been resumed.
  await storage.deleteSavedSession(token as string);

  return c.json(clientSession);
}
