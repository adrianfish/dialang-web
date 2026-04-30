import { loggedIntoReports } from "../../utils/utils.ts";
import type { Context } from "@hono";

export async function sessions(
  c: Context,
  storage: Storage,
): Promise<Response> {
  if (!loggedIntoReports(c)) return c.redirect("/reportslogin");

  const body = await c.req.parseBody();
  const from = body.from;
  const to = body.to;

  const results = await storage.getTestResults();

  if (!from && !to) {
    // Just today's sessions up to now.
    const nowDate = new Date();
    nowDate.setHours(0, 0 ,0);
    const dayStartMillis = nowDate.getTime();
    return c.json({ label: "Todays's Sessions", sessions: results.filter(s => s.started > dayStartMillis) });
  } else {
    const fromMillis = new Date(from).getTime();
    const toMillis = new Date(to).getTime();
    return c.json({ label: `Sessions between ${from} and ${to}`, sessions: results.filter(s => s.started >= fromMillis && s.started <= toMillis) });
  }
  return c.json({});
}
