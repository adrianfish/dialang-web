import { setCookie } from "@hono/cookie";
import { login } from "../../templates/login.ts";
import { createHash } from "../../utils/utils.ts";
import { timingSafeEqual } from "@std/crypto/timing-safe-equal";

import type { Context } from "@hono";

export async function reportsLogin(c: Context, secret: string): Promise<Response> {

  if (c.req.method === "GET") {
    return c.html(login());
  } else {

    const body = await c.req.parseBody();

    const hash: string = body.password as string;
    const testHash: string = await createHash(secret);
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
