import type { Context } from "@hono";
//import { seedVsptWords, seedVsptBands, seedSaGrades, seedSaWeights, seedPreestAssignments, seedPreestWeights } from "../seeds/seeds.ts";
import * as seeds from "../seeds/seeds.ts";
import { parse } from "@std/csv";

export async function loadData(
  c: Context,
  kv: Deno.Kv,
): Promise<Response> {
  const body = await c.req.parseBody();
  const type = body["type"];
  console.log(type);
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
}
