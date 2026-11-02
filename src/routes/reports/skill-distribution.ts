import { loggedIntoReports } from "../../utils/utils.ts";
import { getAllTestSessions } from "../../data-capture/data-capture.ts";

import type { Context }  from "hono";
import type { TestSession }  from  "../../types.ts";

export async function skillDistribution(
  c: Context,
): Promise<Response> {

  if (!loggedIntoReports(c)) return c.redirect("/reportslogin");
  const results: Array<TestSession> = await getAllTestSessions();
  const counts: Record<string, number> = {};
  results.forEach((r: TestSession) => {

    if (r.al) {
      if (counts[r.skill as string]) counts[r.skill as string]++;
      else counts[r.skill as string] = 1;
    }
  });
  return c.json(counts);
}
