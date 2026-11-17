import { env } from "cloudflare:workers";
import { Hono } from 'hono'
import { reports as reportsTemplate } from "../../templates/reports.ts";
import { alDistributionReportTemplate } from "../../templates/al-distribution-report.ts";
import { tlDistributionReportTemplate } from "../../templates/tl-distribution-report.ts";
import { skillDistributionReportTemplate } from "../../templates/skill-distribution-report.ts";
import { underEstimationDistributionReportTemplate } from "../../templates/under-estimation-distribution-report.ts";
import { estimationAccuracyReportTemplate } from "../../templates/estimation-accuracy-report.ts";
import { sessionReportTemplate } from "../../templates/session-report.ts";
import { loggedIntoReports } from "../../utils/utils.ts";
import { sessions } from "./sessions.ts";
import { reportsLogin } from "./reportslogin.ts";
import { alDistribution } from "./al-distribution.ts";
import { tlDistribution } from "./tl-distribution.ts";
import { skillDistribution } from "./skill-distribution.ts";
import { underEstimationDistribution } from "./underestimation-distribution.ts";
import { estimationAccuracy } from "./estimation-accuracy.ts";

import type { Context } from "hono";

const reportsSecret: string | undefined = env.REPORTS_SECRET;

const app = new Hono()

app.get("/", c => {
  if (!loggedIntoReports(c)) return c.redirect("/reports/login");
  return c.html(reportsTemplate);
});

app.on([ "GET", "POST" ], "/login", c => reportsLogin(c, reportsSecret));

app.get("/al-distribution.html", c => {
  if (!loggedIntoReports(c)) return c.redirect("/reports/login");
  return c.html(alDistributionReportTemplate);
});

app.get("/tl-distribution.html", c => {
  if (!loggedIntoReports(c)) return c.redirect("/reports/login");
  return c.html(tlDistributionReportTemplate);
});

app.get("/skill-distribution.html", c => {
  if (!loggedIntoReports(c)) return c.redirect("/reports/login");
  return c.html(skillDistributionReportTemplate);
});

app.get("/under-estimation.html", c => {
  if (!loggedIntoReports(c)) return c.redirect("/reports/login");
  return c.html(underEstimationReportTemplate);
});

app.get("/estimation-accuracy.html", c => {
  if (!loggedIntoReports(c)) return c.redirect("/reports/login");
  return c.html(estimationAccuracyReportTemplate);
});

app.get("/sessions.html", c => {
  if (!loggedIntoReports(c)) return c.redirect("/reports/login");
  return c.html(sessionReportTemplate);
});

app.post("/api/sessions", sessions);
app.get("/api/al-distribution", alDistribution);
app.get("/api/tl-distribution", tlDistribution);
app.get("/api/skill-distribution", skillDistribution);
app.get("/api/underestimation-distribution", underEstimationDistribution);
app.get("/api/estimation-accuracy", estimationAccuracy);

export default app;
