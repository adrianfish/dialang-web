import { getSessionId } from "../utils/utils.ts";
import { getSaPPEAndLevel } from "../scoring/scoring.ts";

export async function scoreSA(
  c: Context,
  storage: Storage,
): Promise<Response> {
  const sessionId = getSessionId(c);
  const session = await storage.getSession(sessionId);

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
		console.error(`Failed to score self assessment for skill ${skill}`);
    c.status(500);
		return c.html("");
	}

	session.saPPE = ppe;
	session.saSubmitted = true;
	session.saLevel = level;

  storage.saveSession(sessionId, session);

  /*
	datacapture.LogSAResponses(&dialangSession, responses)
	datacapture.LogSAScores(&dialangSession)
  */

	storage.logSaScores(session);

	return c.json({ ppe, level });
}
