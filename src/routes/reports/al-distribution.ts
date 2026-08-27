import { loggedIntoReports } from "../../utils/utils.ts";

import type { Context }  from "@hono";
import type { Storage }  from "../../storage/storage.ts";
import type { TestSession }  from  "../../types.ts";

export async function alDistribution(
  c: Context,
  storage: Storage,
): Promise<Response> {
  if (!loggedIntoReports(c)) return c.redirect("/reportslogin");
  const results: Array<TestSession> = await storage.getTestResults();
  const counts: Record<string, number> = {};
  results.forEach((r: TestSession) => {

    if (r.al) {
      if (counts[r.al]) counts[r.al]++;
      else counts[r.al] = 1;
    }
  });
  return c.json(counts);
}
