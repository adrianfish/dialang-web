import { getSession, getSessionId } from "../utils/utils.ts";
import { getSaPPEAndLevel } from "../scoring/scoring.ts";
import { SessionDO } from "../session-do.ts";
import { storeSAResult } from "../data-capture/data-capture.ts";

import type { Context }  from "hono";
import type { SAData } from "../types.ts";
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

  const [saPPE, saLevel, err ] = await getSaPPEAndLevel(await session.getSkill(), responses, storage);
	if (err) {
		console.error(err);
    c.status(500);
		return c.html("");
	}

  const saData: SAData = {
    saPPE,
    saLevel,
    saSubmitted: true,
  };

  await session.saveSA(saData);
  await storeSAResult(await session.getPassId(), saData);

  /*
	datacapture.LogSAResponses(&dialangSession, responses)
	datacapture.LogSAScores(&dialangSession)
  */

	return c.json({ ppe: saPPE, level: saLevel });
}
