import { DenoLTI } from "@adrianfish/deno-lti";

import type { Context } from "@hono/hono";
import type { ContentItem } from "@adrianfish/deno-lti";

export async function handleBuildDeepLinks(
  c: Context,
  lti: DenoLTI,
): Promise<Response> {

  const body = await c.req.parseBody();
  const { al, platformCode, userId, contextId, tls } = body;
  const [ tl, skill ] = tls.split("#");

  const items: ContentItem[] = Object.keys(body).map(id => ({ type: "ltiResourceLink", title: "Danish Reading", custom: { al, tl, skill } }));
  return c.html(lti.createDeepLinkingForm({ platformCode, userId, contextId }, items, "https://adrian-dialang.ngrok.app"));
}
