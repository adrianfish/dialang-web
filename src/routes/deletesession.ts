import { getSessionId } from "../utils/utils.ts";
import type { Context } from "@hono";
import { Storage } from "../storage/storage.ts";

export async function deleteSession(
  c: Context,
  storage: Storage,
): Promise<Response> {
  const sessionId: string = getSessionId(c);
  storage.deleteSession(sessionId);
  return c.html("");
}
