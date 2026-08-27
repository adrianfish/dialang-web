import { loggedIntoReports } from "../../utils/utils.ts";

import type { Context }  from "@hono";
import type { TestSession } from "../../types.ts";
import type { Storage } from "../../storage/storage.ts";

export async function tlDistribution(
  c: Context,
  storage: Storage,
): Promise<Response> {

  if (!loggedIntoReports(c)) return c.redirect("/reportslogin");
  const results: Array<TestSession> = await storage.getTestResults();
  const counts: Record<string, number> = {};
  results.forEach((r: TestSession) => {

    if (r.tl) {
      if (counts[r.tl]) counts[r.tl]++;
      else counts[r.tl] = 1;
    }
  });
  return c.json(counts);
}
