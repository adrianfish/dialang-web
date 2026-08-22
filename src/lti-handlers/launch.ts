import { getConnInfo } from '@hono/deno'
import { setSessionId } from "../utils/utils.ts";

import type { Context } from "@hono";
import type { LTIContext, StoredContextToken } from "@adrianfish/deno-lti";

export const createLTILaunchHandler = (storage: Storage) => {

  return async (c: Context, ltiContext: LTIContext): Response | Promise<Response> => {

    const token: LTIToken = ltiContext.token;

    const { al, tl, skill, hidevspt, hidesa, hidevsptresult, hidefeedbackmenu } = token.platformContext.custom;

    if (!al) {
      return c.redirect("/content/als.html");
    }

    const sessionId = setSessionId(c);

    const session = {
      id: sessionId,
      al,
      user: token.user,
      contextId: token.contextId,
      referrer: c.req.header("Referer"),
      ipAddress: getConnInfo(c).remote.address,
      started: Date.now(),
    };

    if (tl) {
      console.log(tl);
      console.log(skill);
      session.tl = tl;
      session.skill = skill;
    }

    session.hideVSPT = hidevspt;
    session.hideVSPTResult = hidevsptresult;
    session.hideSA = hidesa;
    session.hideFeedbackMenu = hidefeedbackmenu;

    await storage.saveSession(sessionId, session);
    await storage.logTestStart(session);

    return c.redirect("/content/launch.html");
  };
};
