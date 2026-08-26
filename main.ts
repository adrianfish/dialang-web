import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/deno";
import { Storage } from "./src/storage/storage.ts";
import { KVStorage } from "./src/storage/kv-storage.ts";
import { setAl } from "./src/routes/setal.ts";
import { setTl } from "./src/routes/settl.ts";
import { scoreVspt } from "./src/routes/scorevspt.ts";
import { scoreSA } from "./src/routes/scoresa.ts";
import { startTest } from "./src/routes/starttest.ts";
import { submitBasket } from "./src/routes/submitbasket.ts";
import { getSession } from "./src/routes/getsession.ts";
import { deleteSession } from "./src/routes/deletesession.ts";
import { loadData } from "./src/routes/loaddata.ts";
import { reports } from "./src/routes/reports/reports.ts";
import { reportsLogin } from "./src/routes/reports/reportslogin.ts";
import { alDistribution } from "./src/routes/reports/al-distribution.ts";
import { tlDistribution } from "./src/routes/reports/tl-distribution.ts";
import { submitQuestionnaire } from "./src/routes/submitquestionnaire.ts";
import { sessions } from "./src/routes/reports/sessions.ts";
import { createDeepLinkingHandler } from "./src/lti-handlers/deep-linking.ts";
import { createLTILaunchHandler } from "./src/lti-handlers/launch.ts";
import { DenoLTI, DEEPLINKING } from "@adrianfish/deno-lti";
import { handleBuildDeepLinks } from "./src/routes/handle-build-deep-links.ts";

const app: Hono = new Hono();

const storage: Storage = await KVStorage.open();

const hostname: string = Deno.env.get("HOSTNAME") || "adrian-dialang.ngrok.app";
const port: number = parseInt(Deno.env.get("PORT") || 3001);

const ltiSecret: string = Deno.env.get("LTI-SECRET") || "my-encryption-key";
const ltiDescription: string = "Test your language proficiency against the Common European Framework of Reference for Languages (CEFR)."
const ltiLogoUri: string = `https://${hostname}/static/images/large_logo.png`;

const ltiOptions = {
  ltiRoute: "/lti",
  debug: false,
  services: [ DEEPLINKING ],
};

const lti = new DenoLTI();

await lti
  .onLaunch(createLTILaunchHandler(storage))
  .onDeepLinking(createDeepLinkingHandler(storage))
  .setup(hostname, ltiSecret, "Dialang", ltiDescription, ltiLogoUri, ltiOptions);

app.post("/api/setal", (c) => setAl(c, storage));
app.post("/api/settl", (c) => setTl(c, storage));
app.post("/api/scorevspt", (c) => scoreVspt(c, storage));
app.post("/api/scoresa", (c) => scoreSA(c, storage));
app.post("/api/starttest", (c) => startTest(c, storage));
app.post("/api/submitbasket", (c) => submitBasket(c, storage, lti));
app.get("/api/deletesession", (c) => deleteSession(c, storage));
app.get("/api/session", (c) => getSession(c, storage));
app.get("/api/reports/al-distribution", (c) => alDistribution(c, storage));
app.get("/api/reports/tl-distribution", (c) => tlDistribution(c, storage));
app.post("/api/reports/sessions", (c) => sessions(c, storage));
app.post("/api/loaddata", (c) => loadData(c, storage.getKv()));
app.post("/api/submitquestionnaire", (c) => submitQuestionnaire(c, storage));
app.on([ "GET", "POST" ], "/reportslogin", (c) => reportsLogin(c, storage));
app.get("/reports/:report?", (c) => reports(c, storage));
app.post("/api/builddeeplinks", (c) => handleBuildDeepLinks(c, lti, storage));

app.route(ltiOptions.ltiRoute, lti.handler());

app.use("/*", serveStatic({ root: "./static/" }));

Deno.serve({ port, hostname: "127.0.0.1" }, app.fetch);
