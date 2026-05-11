import { getSessionId } from "../utils/utils.ts";
import type { Context } from "@hono";
import { Storage } from "../storage/storage.ts";

export async function getSession(
  c: Context,
  storage: Storage,
): Promise<Response> {
  const sessionId: string = getSessionId(c);
  return c.json(await storage.getSession(sessionId));
}
