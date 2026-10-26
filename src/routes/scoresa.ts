import { Context }  from "@hono";
import { getSession, getSessionId } from "../utils/utils.ts";
import { getSaPPEAndLevel } from "../scoring/scoring.ts";
import { SessionDO } from "../session-do.ts";

import type { DialangSession } from "../types.ts";
import type { Storage } from "../storage/storage.ts";

export async function scoreSA(c: Context, storage: Storage): Promise<Response> {

  const session: SessionDO | null = getSession(c);
  if (!session) {
    console.error("Failed to get session");
		c.status(500);
		return c.html("");
  }

  const body = await c.req.json();

  const responses: Record<string, boolean> = Object.fromEntries(
      Object.entries(body)
        .filter(([k, _]) => k.startsWith("statement:"))
        .map(([k, v]) => [ k.split(":")[1], v === "yes"])
    );

  const [ppe, level, err ] = await getSaPPEAndLevel(await session.getSkill(), responses, storage);
	if (err) {
		console.error(err);
    c.status(500);
		return c.html("");
	}

	session.saPPE = ppe as number;
	session.saSubmitted = true;
	session.saLevel = level as string;

  const saData: SAData = {
    ppe,
    level,
    submitted: true,
  };

  await session.saveSA(saData);

  /*
	datacapture.LogSAResponses(&dialangSession, responses)
	datacapture.LogSAScores(&dialangSession)
  */

	return c.json({ ppe, level });
}
