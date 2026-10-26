import { Hono } from "hono";
import { env } from "cloudflare:workers";
import { KVStorage } from "./src/storage/kv-storage.ts";
import { content } from "./src/routes/content.ts";
import { setAl } from "./src/routes/setal.ts";
import { setTl } from "./src/routes/settl.ts";
import { scoreVspt } from "./src/routes/scorevspt.ts";
import { scoreSA } from "./src/routes/scoresa.ts";
import { startTest } from "./src/routes/starttest.ts";
import { submitBasket } from "./src/routes/submitbasket.ts";
import { resumeSession } from "./src/routes/resumesession.ts";
import { saveSession } from "./src/routes/savesession.ts";
import { getSession } from "./src/routes/getsession.ts";
import { deleteSession } from "./src/routes/deletesession.ts";
import { reports } from "./src/routes/reports/reports.ts";
import { reportsLogin } from "./src/routes/reports/reportslogin.ts";
import { alDistribution } from "./src/routes/reports/al-distribution.ts";
import { tlDistribution } from "./src/routes/reports/tl-distribution.ts";
import { skillDistribution } from "./src/routes/reports/skill-distribution.ts";
import { submitQuestionnaire } from "./src/routes/submitquestionnaire.ts";
import { sessions } from "./src/routes/reports/sessions.ts";
import { SessionDO } from "./src/session-do.ts";
//import { deepLinkingHandler } from "./src/lti-handlers/deep-linking.ts";
//import { createLTILaunchHandler } from "./src/lti-handlers/launch.ts";
//import { LTIKit, DEEPLINKING } from "@adrianfish/lti-kit";
//import { handleBuildDeepLinks } from "./src/routes/handle-build-deep-links.ts";

import type { ENV } from "./src/session-do.ts";
import type { Storage } from "./src/storage/storage.ts";

const app: Hono = new Hono<{ Bindings: ENV }>();

const storage: Storage = await KVStorage.open();

const hostname: string = env.HOSTNAME || "adrian-dialang.ngrok.app";
const port: number = parseInt(env.PORT || "8787");

/*
const ltiSecret: string | undefined = env.LTI_SECRET;
if (!ltiSecret) {
  console.error("No LTI_SECRET defined as an environment variable. Exiting ...");
  exit(1);
}

const ltiDescription: string = "Test your language proficiency against the Common European Framework of Reference for Languages (CEFR)."
const ltiLogoUri: string = `https://${hostname}/static/images/large_logo.png`;

const ltiOptions = {
  ltiRoute: "/lti",
  debug: false,
  services: [ DEEPLINKING ],
};

const lti = new LTIKit();

await lti
  .onLaunch(createLTILaunchHandler(storage))
  .onDeepLinking(deepLinkingHandler)
  .setup(hostname, ltiSecret, "Dialang", ltiDescription, ltiLogoUri, ltiOptions);
*/

app.post("/api/setal", c => setAl(c, storage));
app.post("/api/settl", (c) => setTl(c, storage));
app.post("/api/scorevspt", (c) => scoreVspt(c, storage));
app.post("/api/scoresa", (c) => scoreSA(c, storage));
app.post("/api/starttest", (c) => startTest(c, storage));
//app.post("/api/submitbasket", (c) => submitBasket(c, storage, lti));
app.post("/api/submitbasket", (c) => submitBasket(c, storage));
app.post("/api/resumesession", (c) => resumeSession(c, storage));
app.get("/content/*", content);
app.get("/images/*", content);
app.get("/api/savesession", (c) => saveSession(c, storage));
app.get("/api/deletesession", (c) => deleteSession(c, storage));
app.get("/api/session", (c) => getSession(c, storage));
app.get("/api/reports/al-distribution", (c) => alDistribution(c, storage));
app.get("/api/reports/tl-distribution", (c) => tlDistribution(c, storage));
app.get("/api/reports/skill-distribution", (c) => skillDistribution(c, storage));
app.post("/api/reports/sessions", (c) => sessions(c, storage));
app.post("/api/submitquestionnaire", (c) => submitQuestionnaire(c, storage));
const reportsSecret: string | undefined = env.REPORTS_SECRET;
app.on([ "GET", "POST" ], "/reportslogin", (c) => reportsLogin(c, reportsSecret));
app.get("/reports/:report?", (c) => reports(c));
app.post("/api/builddeeplinks", (c) => handleBuildDeepLinks(c, lti, storage));

//app.route(ltiOptions.ltiRoute, lti.handler());

app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export { SessionDO };
export default app;
