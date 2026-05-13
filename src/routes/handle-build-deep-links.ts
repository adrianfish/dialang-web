import { DenoLTI } from "@adrianfish/deno-lti";

import type { Context } from "@hono/hono";
import type { ContentItem } from "@adrianfish/deno-lti";

export async function handleBuildDeepLinks(
  c: Context,
  lti: DenoLTI,
): Promise<Response> {
  const url = "https://adrian-dialang-lti.ngrok.app/balls.html";
  const body = await c.req.parseBody();
  const { platformCode, userId, contextId } = body;
  const items: ContentItem[] = Object.keys(body).map(id => ({ type: "ltiResourceLink", title: "Balls", text: "Some balls", url }));
  return c.html(lti.DeepLinking.createDeepLinkingForm({ platformCode, userId, contextId }, items, "https://adrian-dialang-lti.ngrok.app"));
}
