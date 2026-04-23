import type { Context } from "@hono";
import * as seeds from "../seeds/seeds.ts";
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
  const testHash = createHash(loadSecret);
  if (hash !== testHash) {
    c.status(403);
    return c.html("");
  }
  return c.html("");

  /*
  const type = body["type"];
  const file = body["file"];

  switch (type) {
    case "vspt_words":
      await seeds.seedVsptWords(file, kv);
      break;
    case "vspt_bands":
      await seeds.seedVsptBands(file, kv);
      break;
    case "sa_grades":
      await seeds.seedSaGrades(file, kv);
      break;
    case "sa_weights":
      await seeds.seedSaWeights(file, kv);
      break;
    case "preest_assignments":
      await seeds.seedPreestAssignments(file, kv);
      break;
    case "preest_weights":
      await seeds.seedPreestWeights(file, kv);
      break;
    case "booklet_lengths":
      await seeds.seedBookletLengths(file, kv);
      break;
    case "booklet_baskets":
      await seeds.seedBookletBaskets(file, kv);
      break;
    case "items":
      await seeds.seedItems(file, kv);
      break;
    case "answers":
      await seeds.seedAnswers(file, kv);
      break;
    case "item_answers":
      await seeds.seedItemAnswers(file, kv);
      break;
    case "punctuation":
      await seeds.seedPunctuation(file, kv);
      break;
    case "item_grades":
      await seeds.seedItemGrades(file, kv);
      break;
    default:
  }
  return c.html("");
  */
}
