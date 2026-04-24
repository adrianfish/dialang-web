import { getCookie } from "@hono/cookie";
import type { Context } from "@hono";
import { reports as reportsTemplate } from "../templates/reports.ts";
import { alDistributionTemplate } from "../templates/al-distribution-template.ts";

export async function reports(c: Context): Promise<Response> {

  const reportsSessionId = getCookie(c, "dialang-reports");

  if (!reportsSessionId) {
    return c.redirect("/reportslogin");
  }

  switch (c.req.param("report")) {
    case "al-distribution":
      return c.html(alDistributionTemplate);
    default:
      return c.html(reportsTemplate);
  }
}
