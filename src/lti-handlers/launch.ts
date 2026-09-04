import { getConnInfo } from '@hono/deno'
import { setSessionId } from "../utils/utils.ts";

import type { Context } from "@hono";
import type { LTIContext, LTIToken, StoredContextToken } from "@adrianfish/lti-kit";
import type { DialangSession } from "../types.ts";
import type { Storage } from "../storage/storage.ts";

export const createLTILaunchHandler = (storage: Storage) => {

  return async (c: Context, ltiContext: LTIContext): Promise<Response> => {

    const token: LTIToken = ltiContext.token;

    const { al, tl, skill, hidevspt, hidesa, hidevsptresult, hidefeedbackmenu } = token.platformContext.custom;

    if (!al) {
      return c.redirect("/content/als.html");
    }

    const sessionId = setSessionId(c);

    const session: DialangSession = {
      id: sessionId,
      al: al as string,
      user: token.user,
      referrer: c.req.header("Referer") || "",
      ipAddress: getConnInfo(c).remote.address || "",
      started: Date.now(),
    };

    if (tl) {
      session.tl = tl as string;
      session.skill = skill as string;
    }

    session.isLTI = true;
    session.hideVSPT = hidevspt as boolean;
    session.hideVSPTResult = hidevsptresult as boolean;
    session.hideSA = hidesa as boolean;
    session.hideFeedbackMenu = hidefeedbackmenu as boolean;

    await storage.saveSession(sessionId, session);
    await storage.logTestStart(session);

    return c.redirect(`/content/launch.html?ltik=${c.get("ltik")}`);
  };
};
