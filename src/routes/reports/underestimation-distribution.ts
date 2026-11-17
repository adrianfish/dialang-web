import { env } from "cloudflare:workers";
import { loggedIntoReports } from "../../utils/utils.ts";

import type { Context }  from "hono";
import type { TestSession } from "../../types.ts";

export async function underEstimationDistribution(
  c: Context,
): Promise<Response> {

  if (!loggedIntoReports(c)) return c.redirect("/reportslogin");

  const underEstimates = await env.DIALANG_RESULTS.prepare(`
    SELECT tl, count(*) FROM passes
      WHERE sa_level IS NOT NULL
        AND item_level IS NOT NULL
        AND sa_level < item_level
          GROUP BY tl
  `).run();

  return c.json(underEstimates.results);
}
