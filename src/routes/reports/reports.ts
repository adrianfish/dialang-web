import { getCookie } from "@hono/cookie";
import { reports as reportsTemplate } from "../../templates/reports.ts";
import { alDistributionReportTemplate } from "../../templates/al-distribution-report.ts";
import { tlDistributionReportTemplate } from "../../templates/tl-distribution-report.ts";
import { sessionReportTemplate } from "../../templates/session-report.ts";
import { loggedIntoReports } from "../../utils/utils.ts";
import type { Context } from "@hono";

export async function reports(c: Context): Promise<Response> {

  if (!loggedIntoReports(c)) return c.redirect("/reportslogin");

  switch (c.req.param("report")) {
    case "al-distribution":
      return c.html(alDistributionReportTemplate);
    case "tl-distribution":
      return c.html(tlDistributionReportTemplate);
    case "sessions":
      return c.html(sessionReportTemplate);
    default:
      return c.html(reportsTemplate);
  }
}
