import { getCookie } from "@hono/cookie";
import type { Context } from "@hono";

export async function reports(c: Context): Promise<Response> {

  const reportsSessionId = getCookie(c, "dialang-reports");

  if (!reportsSessionId) {
    return c.redirect("/reportslogin");
  }

  return c.html("<html><h1>REPORTS</h1></html>");
}
