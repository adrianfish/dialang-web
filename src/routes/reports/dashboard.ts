import { env } from "cloudflare:workers";
import { loggedIntoReports } from "../../utils/utils.ts";
import { getAllTestSessions } from "../../data-capture/data-capture.ts";

import type { Context }  from "hono";
import type { TestSession }  from  "../../types.ts";

export async function dashboard(c: Context): Promise<Response> {

  if (!loggedIntoReports(c)) return c.redirect("/reportslogin");

  const al = (await env.DIALANG_RESULTS.prepare(`
    SELECT al, count(*) as total FROM sessions GROUP BY al
  `)
  .run()).results.reduce((acc, r) => {
    acc[r.al] = r.total;
    return acc;
  }, {});

  const tl = (await env.DIALANG_RESULTS.prepare(`
    SELECT tl, count(*) as total FROM passes GROUP BY tl
  `)
  .run()).results.reduce((acc, r) => {
    acc[r.tl] = r.total;
    return acc;
  }, {});

  const skill = (await env.DIALANG_RESULTS.prepare(`
    SELECT skill, count(*) as total FROM passes GROUP BY skill
  `)
  .run()).results.reduce((acc, r) => {
    acc[r.skill] = r.total;
    return acc;
  }, {});

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

  const estimation = { under: counts[0].results[0].total, accurate: counts[1].results[0].total, over: counts[2].results[0].total };

  return c.json({ al, tl, skill, estimation });
}
