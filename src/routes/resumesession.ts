import { Context } from "hono";
import { forceSessionId, getSession, getSessionFromId } from "../utils/utils.ts";
import { getSavedSession, deleteSavedSession } from "../data-capture/data-capture.ts";
import { SessionDO } from "../session-do.ts";

import type { SavedDialangSession } from "../types.ts";

export async function resumeSession(
  c: Context,
): Promise<Response> {

  const { token } = await c.req.parseBody();

  const savedSession: SavedDialangSession | null = await getSavedSession(token as string);

  if (!savedSession) {
		console.error(`No session for token ${token}`);
		c.status(500);
		return c.json({});
  }

  console.log(savedSession);

  if (!savedSession.currentBasketId || !savedSession.bookletId) {
		console.error(`currentBasketId and bookletId must be set on session for token ${token}`);
		c.status(500);
		return c.json({});
  }

  // Get the current session. The user will have created one to get this far and we need to clear
  // out the durable object's data.
  const currentSession: SessionDO = getSession(c);

  // Save the saved session as a "current" session
  await getSessionFromId(c, savedSession.sessionId).saveSession(savedSession);

  // Set the saved session id in the session cookie so the client picks it up.
  forceSessionId(c, savedSession.sessionId);

  const clientSession = {
    id: savedSession.sessionId,
    al: savedSession.al,
    tl: savedSession.tl,
    skill: savedSession.skill,
    vsptSubmitted: savedSession.vsptSubmitted,
    saSubmitted: savedSession.saSubmitted,
    saLevel: savedSession.saLevel,
    vsptLevel: savedSession.vsptLevel,
    vsptMearaScore: savedSession.vsptMearaScore,
    scoredBaskets: savedSession.scoredBaskets,
    currentBasketId: savedSession.currentBasketId,
  };

  // Delete the saved session. It has been resumed.
  await deleteSavedSession(token as string);
  await currentSession.delete();

  return c.json(clientSession);
}
