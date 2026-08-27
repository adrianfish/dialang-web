import { Context }  from "@hono";
import { getSessionId } from "../utils/utils.ts";
import { getSaPPEAndLevel } from "../scoring/scoring.ts";
import type { DialangSession } from "../types.ts";
import type { Storage } from "../storage/storage.ts";

export async function scoreSA(c: Context, storage: Storage): Promise<Response> {

  const sessionId = getSessionId(c);
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

	if (!session.tl || !session.skill) {
		c.status(500);
		return c.html("");
	}

  const body = await c.req.json();

  const responses: Record<string, boolean> = Object.fromEntries(
      Object.entries(body)
        .filter(([k, v]) => k.startsWith("statement:"))
        .map(([k, v]) => [ k.split(":")[1], v === "yes"])
    );

  const [ppe, level, err ] = await getSaPPEAndLevel(session.skill, responses, storage);
	if (err) {
		console.error(`Failed to score self assessment for skill ${session.skill}`);
    c.status(500);
		return c.html("");
	}

	session.saPPE = ppe as number;
	session.saSubmitted = true;
	session.saLevel = level as string;

  storage.saveSession(sessionId, session);

  /*
	datacapture.LogSAResponses(&dialangSession, responses)
	datacapture.LogSAScores(&dialangSession)
  */

	storage.logSaScores(session);

	return c.json({ ppe, level });
}
