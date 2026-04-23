import type { Context } from "@hono";
import * as loaders from "../dataloaders/dataloaders.ts";
import { parse } from "@std/csv";
import { createHash } from "../utils/utils.ts";

export async function loadData(
  c: Context,
  kv: Deno.Kv,
): Promise<Response> {

  const loadSecret = Deno.env.get("LOAD_SECRET");
  if (!loadSecret) {
    c.status(500);
    return c.html("");
  }

  const body = await c.req.parseBody();
  const hash = body["hash"];
  const testHash = await createHash(loadSecret);
  if (hash !== testHash) {
    c.status(403);
    return c.html("");
  }

  const type = body["type"];
  const file = body["file"];
  const clear = body["clear"];

  if ("true" === clear) {
    const prefix = [];
    //const prefix = [ "data" ];
    (type !== "all") && prefix.push(type);
    const iter = kv.list({ prefix });
    const promises = [];
    for await (const entry of iter) {
      promises.push(kv.delete(entry.key));
    }
    await Promise.all(promises);
    return c.html("");
  }

  switch (type) {
    case "vspt-words":
      await loaders.loadVsptWords(file, kv);
      break;
    case "vspt-bands":
      await loaders.loadVsptBands(file, kv);
      break;
    case "sa-grades":
      await loaders.loadSaGrades(file, kv);
      break;
    case "sa-weights":
      await loaders.loadSaWeights(file, kv);
      break;
    case "preest-assignments":
      await loaders.loadPreestAssignments(file, kv);
      break;
    case "preest-weights":
      await loaders.loadPreestWeights(file, kv);
      break;
    case "booklet-lengths":
      await loaders.loadBookletLengths(file, kv);
      break;
    case "booklet-baskets":
      await loaders.loadBookletBaskets(file, kv);
      break;
    case "items":
      await loaders.loadItems(file, kv);
      break;
    case "answers":
      await loaders.loadAnswers(file, kv);
      break;
    case "item-answers":
      await loaders.loadItemAnswers(file, kv);
      break;
    case "punctuation":
      await loaders.loadPunctuation(file, kv);
      break;
    case "item-grades":
      await loaders.loadItemGrades(file, kv);
      break;
    default:
  }
  return c.html("");
}
