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

const app: Hono = new Hono();

const storage: Storage = await KVStorage.open();
app.post("/api/setal", (c) => setAl(c, storage));
app.post("/api/settl", (c) => setTl(c, storage));
app.post("/api/scorevspt", (c) => scoreVspt(c, storage));
app.post("/api/scoresa", (c) => scoreSA(c, storage));
app.post("/api/starttest", (c) => startTest(c, storage));
app.post("/api/submitbasket", (c) => submitBasket(c, storage));
app.get("/api/deletesession", (c) => deleteSession(c, storage));
app.use("/*", serveStatic({ root: "./static/" }));

Deno.serve({ port: 3001, hostname: "127.0.0.1" }, app.fetch);
