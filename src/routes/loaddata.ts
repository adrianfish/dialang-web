import type { Context } from "@hono";
import { seedVsptWords } from "../seeds/seeds.ts";
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
    case "vspt-words":
      await seedVsptWords(file, kv);
      break;
    default:
  }
  return c.html("");
}
