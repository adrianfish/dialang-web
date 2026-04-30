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
import { deleteSession } from "./src/routes/deletesession.ts";
import { loadData } from "./src/routes/loaddata.ts";
import { reports } from "./src/routes/reports/reports.ts";
import { reportsLogin } from "./src/routes/reports/reportslogin.ts";
import { alDistribution } from "./src/routes/reports/al-distribution.ts";
import { tlDistribution } from "./src/routes/reports/tl-distribution.ts";
import { submitQuestionnaire } from "./src/routes/submitquestionnaire.ts";
import { sessions } from "./src/routes/reports/sessions.ts";

const app: Hono = new Hono();

const storage: Storage = await KVStorage.open();
app.post("/api/setal", (c) => setAl(c, storage));
app.post("/api/settl", (c) => setTl(c, storage));
app.post("/api/scorevspt", (c) => scoreVspt(c, storage));
app.post("/api/scoresa", (c) => scoreSA(c, storage));
app.post("/api/starttest", (c) => startTest(c, storage));
app.post("/api/submitbasket", (c) => submitBasket(c, storage));
app.get("/api/deletesession", (c) => deleteSession(c, storage));
app.get("/api/reports/al-distribution", (c) => alDistribution(c, storage));
app.get("/api/reports/tl-distribution", (c) => tlDistribution(c, storage));
app.post("/api/reports/sessions", (c) => sessions(c, storage));
app.post("/api/loaddata", (c) => loadData(c, storage.getKv()));
app.post("/api/submitquestionnaire", (c) => submitQuestionnaire(c, storage));
app.on([ "GET", "POST" ], "/reportslogin", (c) => reportsLogin(c, storage));
app.get("/reports/:report?", (c) => reports(c, storage));

app.use("/*", serveStatic({ root: "./static/" }));

Deno.serve({ port: 3001, hostname: "127.0.0.1" }, app.fetch);
