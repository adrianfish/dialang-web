import { env } from "cloudflare:workers";
import { Hono } from 'hono'
import { reports as reportsTemplate } from "../../templates/reports/reports.ts";
import { dashboardTemplate } from "../../templates/reports/dashboard.ts";
import { sessionReportTemplate } from "../../templates/reports/session-report.ts";
import { loggedIntoReports } from "../../utils/utils.ts";
import { sessions } from "./sessions.ts";
import { reportsLogin } from "./reportslogin.ts";
import { dashboard } from "./dashboard.ts";

import type { Context } from "hono";

const reportsSecret: string | undefined = env.REPORTS_SECRET;

const app = new Hono()

app.get("/", c => {
  if (!loggedIntoReports(c)) return c.redirect("/reports/login");
  return c.html(reportsTemplate);
});

app.on([ "GET", "POST" ], "/login", c => reportsLogin(c, reportsSecret));

app.get("/sessions.html", c => {
  if (!loggedIntoReports(c)) return c.redirect("/reports/login");
  return c.html(sessionReportTemplate);
});

app.get("/dashboard.html", c => {
  if (!loggedIntoReports(c)) return c.redirect("/reports/login");
  return c.html(dashboardTemplate);
});


app.post("/api/sessions", sessions);
app.get("/api/dashboard", dashboard);

export default app;
