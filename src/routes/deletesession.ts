import { getCookie } from "@hono/cookie";
import type { Context } from "@hono";
import { Storage } from "../storage/storage.ts";

export async function deleteSession(
  c: Context,
  storage: Storage,
): Promise<Response> {
  const sessionId: string = getCookie(c, "dialang");
  storage.deleteSession(sessionId);
  return c.html("");
}
