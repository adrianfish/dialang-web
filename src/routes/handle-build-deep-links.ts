import { LTIKit } from "@adrianfish/lti-kit";

import type { Context } from "@hono/hono";
import type { ContentItem } from "@adrianfish/lti-kit";
import type { Storage } from "../storage/storage.ts";

export async function handleBuildDeepLinks(
  c: Context,
  lti: LTIKit,
  storage: Storage,
): Promise<Response> {

  const body = await c.req.parseBody();
  const { al, platformCode, userId, contextId, tls } = body;
  const [ tl, skill ] = (tls as string).split("#");

  const languageName: string | null = await storage.getLanguageName(al as string, tl as string);
  if (!languageName) {
    console.error(`No language name found for al ${al} and tl ${tl}`);
    c.status(500);
    c.html("");
  }

  const skillName: string | null = await storage.getSkillName(al as string, skill as string);
  if (!skillName) {
    console.error(`No skill name found for al ${al} and skill ${skill}`);
    c.status(500);
    c.html("");
  }

  const item: ContentItem = {
    type: "ltiResourceLink",
    title: `${languageName} ${skillName}`,
    lineItem: { scoreMaximum: 1000 },
    custom: { al, tl, skill },
  };
  return c.html(lti.createDeepLinkingForm({ platformCode: platformCode as string, userId: userId as string, contextId: contextId as string }, [ item ], "https://adrian-dialang.ngrok.app"));
}
