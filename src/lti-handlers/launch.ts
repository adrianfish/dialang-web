import { getConnInfo } from 'hono/cloudflare-workers'
import { getSessionFromId, setSessionId } from "../utils/utils.ts";
import { storeAdminLanguage, storeTestLanguageAndSkill } from "../data-capture/data-capture.ts";
import { SessionDO } from "../session-do.ts";

import type { Context } from "hono";
import type { LTIContext, LTIToken } from "@adrianfish/lti-kit";
import type { ALData, DialangSession } from "../types.ts";

export async function launchHandler(c: Context, ltiContext: LTIContext): Promise<Response> {

  const token: LTIToken = ltiContext.token;

  const { al, tl, skill, hidevspt, hidesa, hidevsptresult, hidefeedbackmenu } = token.platformContext.custom;

  if (!al) {
    return c.redirect("/content/als.html");
  }

  const sessionId = setSessionId(c);
  const session: SessionDO = getSessionFromId(c, sessionId);

  const dialangSession: DialangSession = {
    sessionId,
    al: al as string,
    user: token.user,
    referrer: c.req.header("Referer") || "",
    ipAddress: getConnInfo(c).remote.address || "",
    started: Date.now(),
  };

  if (tl) {
    dialangSession.tl = tl as string;
    dialangSession.skill = skill as string;
  }

  dialangSession.isLTI = true;
  dialangSession.hideVSPT = hidevspt as boolean;
  dialangSession.hideVSPTResult = hidevsptresult as boolean;
  dialangSession.hideSA = hidesa as boolean;
  dialangSession.hideFeedbackMenu = hidefeedbackmenu as boolean;

  await session.saveSession(dialangSession);

  const alData: ALData = {
    sessionId,
    al: dialangSession.al,
    referrer: dialangSession.referrer,
    ipAddress: dialangSession.ipAddress,
  };
  await storeAdminLanguage(sessionId, alData);
  await storeTestLanguageAndSkill(crypto.randomUUID(), sessionId, dialangSession.tl as string, dialangSession.skill as string);

  return c.redirect(`/content/launch.html?ltik=${c.get("ltik")}`);
}
