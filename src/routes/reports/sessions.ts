import { loggedIntoReports } from "../../utils/utils.ts";

import type { Context } from "@hono";
import type { TestSession } from "../../types.ts";
import type { Storage } from "../../storage/storage.ts";

export async function sessions(
  c: Context,
  storage: Storage,
): Promise<Response> {
  if (!loggedIntoReports(c)) return c.redirect("/reportslogin");

  const body = await c.req.parseBody();
  const from: string = body.from as string;
  const to: string = body.to as string;
  const completed: boolean = !!body.completed;

  const results: Array<TestSession> = await storage.getTestSessions(completed);

  if (!from && !to) {
    // Just today's sessions up to now.
    const nowDate = new Date();
    nowDate.setHours(0, 0 ,0);
    const dayStartMillis = nowDate.getTime();
    const sessions: Array<TestSession> = results.filter(s => s.started > dayStartMillis).sort((a, b) => a.started - b.started);
    return c.json({ label: "Today's Sessions", sessions });
  } else {
    const fromMillis = new Date(from).getTime();
    const toMillis = new Date(to).getTime();
    const sessions: Array<TestSession> = results.filter(s => s.started >= fromMillis && s.started <= toMillis).sort((a, b) => a.started - b.started);
    return c.json({ label: `Sessions between ${from} and ${to}`, sessions });
  }
}
