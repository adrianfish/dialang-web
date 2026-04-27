import { getCookie } from "@hono/cookie";
import type { Context } from "@hono";
import { reports as reportsTemplate } from "../templates/reports.ts";
import { alDistributionReportTemplate } from "../templates/al-distribution-report.ts";
import { sessionReportTemplate } from "../templates/session-report.ts";

export async function reports(c: Context): Promise<Response> {

  const reportsSessionId = getCookie(c, "dialang-reports");

  if (!reportsSessionId) {
    return c.redirect("/reportslogin");
  }

  switch (c.req.param("report")) {
    case "al-distribution":
      return c.html(alDistributionReportTemplate);
    case "sessions":
      return c.html(sessionReportTemplate);
    default:
      return c.html(reportsTemplate);
  }
}
