import { getSessionId } from "../utils/utils.ts";

export async function submitQuestionnaire(c: Context, storage: Storage): Promise<Response> {

  const body = await c.req.parseBody();

	await storage.storeQuestionnaire(getSessionId(c), body);

  return c.html("");
}
