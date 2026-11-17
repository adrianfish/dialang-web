import { env } from "cloudflare:workers";
import { loggedIntoReports } from "../../utils/utils.ts";

import type { Context }  from "hono";

export async function estimationAccuracy(c: Context): Promise<Response> {

  if (!loggedIntoReports(c)) return c.redirect("/reportslogin");

  const counts = await env.DIALANG_RESULTS.batch([
    env.DIALANG_RESULTS.prepare(`
      SELECT count(*) as total FROM passes
        WHERE sa_level IS NOT NULL
          AND item_level IS NOT NULL
          AND sa_level < item_level
    `),
    env.DIALANG_RESULTS.prepare(`
      SELECT count(*) as total FROM passes
        WHERE sa_level IS NOT NULL
          AND item_level IS NOT NULL
          AND sa_level = item_level
    `),
    env.DIALANG_RESULTS.prepare(`
      SELECT count(*) as total FROM passes
        WHERE sa_level IS NOT NULL
          AND item_level IS NOT NULL
          AND sa_level > item_level
    `)
  ]);

  const data = { under: counts[0].results[0].total, accurate: counts[1].results[0].total, over: counts[2].results[0].total };
  return c.json(data);
}
