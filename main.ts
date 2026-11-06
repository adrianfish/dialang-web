import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { env } from "cloudflare:workers";
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
import reports from "./src/routes/reports/reports.ts";
import { submitQuestionnaire } from "./src/routes/submitquestionnaire.ts";
import { SessionDO } from "./src/session-do.ts";
import { errorHandler, notFoundHandler } from "./src/error-handlers.ts";
//import { deepLinkingHandler } from "./src/lti-handlers/deep-linking.ts";
//import { launchHandler } from "./src/lti-handlers/launch.ts";
//import { LTIKit, DEEPLINKING } from "@adrianfish/lti-kit";
//import { handleBuildDeepLinks } from "./src/routes/handle-build-deep-links.ts";

import type { Env } from "./src/session-do.ts";

/* @ts-ignore */
const app: Hono = new Hono<{ Bindings: Env }>();

/* @ts-ignore */
const hostname: string = env.HOSTNAME || "adrian-dialang.ngrok.app";
/* @ts-ignore */
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
  .onLaunch(launchHandler)
  .onDeepLinking(deepLinkingHandler)
  .setup(hostname, ltiSecret, "Dialang", ltiDescription, ltiLogoUri, ltiOptions);
*/

app.route("/reports", reports);

app.get("/content/*", content);
app.get("/images/*", content);

app.post("/api/setal", setAl);
app.post("/api/settl", setTl);
app.post("/api/scorevspt", scoreVspt);
app.post("/api/scoresa", scoreSA);
app.post("/api/starttest", startTest);
//app.post("/api/submitbasket", (c) => submitBasket(c, lti));
app.post("/api/submitbasket", submitBasket);
app.post("/api/resumesession", resumeSession);
app.post("/api/submitquestionnaire", submitQuestionnaire);
app.get("/api/savesession", saveSession);
app.get("/api/deletesession", deleteSession);
app.get("/api/session", getSession);

app.onError(errorHandler);
app.notFound(notFoundHandler);
//app.post("/api/builddeeplinks", (c) => handleBuildDeepLinks(c, lti));

//app.route(ltiOptions.ltiRoute, lti.handler());

/* @ts-ignore */
app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export { SessionDO };
export default app;
