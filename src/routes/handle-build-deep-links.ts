import { DenoLTI } from "@adrianfish/deno-lti";

import type { Context } from "@hono/hono";
import type { ContentItem } from "@adrianfish/deno-lti";
import type { Storage } from "../storage/storage.ts";

export async function handleBuildDeepLinks(
  c: Context,
  lti: DenoLTI,
  storage: Storage,
): Promise<Response> {

  const body = await c.req.parseBody();
  const { al, platformCode, userId, contextId, tls } = body;
  const [ tl, skill ] = tls.split("#");

  const languageName = await storage.getLanguageName(al, tl);
  const skillName = await storage.getSkillName(al, skill);

  const item: ContentItem = {
    type: "ltiResourceLink",
    title: `${languageName} ${skillName}`,
    lineItem: { scoreMaximum: 1000 },
    custom: { al, tl, skill },
  };
  return c.html(lti.createDeepLinkingForm({ platformCode, userId, contextId }, [ item ], "https://adrian-dialang.ngrok.app"));
}
