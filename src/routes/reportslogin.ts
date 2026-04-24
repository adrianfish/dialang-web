import { setCookie } from "@hono/cookie";
import { login } from "../templates/login.ts";
import { createHash } from "../utils/utils.ts";
import { timingSafeEqual } from "@std/crypto/timing-safe-equal";

import type { Context } from "@hono";

export async function reportsLogin(c: Context): Promise<Response> {

  if (c.req.method === "GET") {
    return c.html(login());
  } else {
    const dataSecret = Deno.env.get("DATA_SECRET");
    if (!dataSecret) {
      c.status(500);
      return c.html("<html><h1>ERROR</h1></html>");
    }

    const body = await c.req.parseBody();

    const hash = body.password;
    const testHash = await createHash(dataSecret);
    const a = new TextEncoder().encode(hash)
    const b = new TextEncoder().encode(testHash)
    const match = a.length === b.length && timingSafeEqual(a, b)
    if (!match) {
      c.status(403);
      return c.html("");
    }

    setCookie(c, "dialang-reports", "123");

    return c.redirect("/reports");
  }
}
