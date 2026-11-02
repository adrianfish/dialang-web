import { loggedIntoReports } from "../../utils/utils.ts";
import { getTestSessions } from "../../data-capture/data-capture.ts";

import type { Context } from "hono";
import type { TestSession } from "../../types.ts";

export async function sessions(
  c: Context,
): Promise<Response> {
  if (!loggedIntoReports(c)) return c.redirect("/reportslogin");

  const body = await c.req.parseBody();
  const from: string = body.from as string;
  const to: string = body.to as string;
  const completed: boolean = !!body.completed;
  const today: boolean = !!body.today;

  let fromMillis, toMillis;
  if (today) {
    // Just today's sessions up to now.
    fromMillis = new Date().setHours(0, 0 ,0);
    toMillis = Date.now();
  } else {
    fromMillis = from ? new Date(from).getTime() : 0;
    toMillis = to ? new Date(to).getTime() : Date.now();
  }

  const sessions: Array<TestSession> = await getTestSessions(fromMillis, toMillis, completed);
  console.log(sessions);
  return c.json({ label: `Sessions from ${from ? from : "the start of time"} to ${to ? to : "now"}`, sessions });
}
