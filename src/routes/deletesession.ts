import { getSession } from "../utils/utils.ts";
import { SessionDO} from "../session-do.ts";

import type { Context } from "hono";

export async function deleteSession(c: Context): Promise<Response> {

  const session: SessionDO | null = getSession(c);
  if (!session) {
    console.error("Failed to get session id");
		c.status(500);
		return c.html("");
  }

  await session.delete();
  return c.html("");
}
