import { getConnInfo } from '@hono/deno'
import { setSessionId } from "../utils/utils.ts";

import type { Context } from "@hono";
import type { StoredContextToken } from "@adrianfish/deno-lti";

export const createLTILaunchHandler = (storage: Storage) => {

  return async (c: Context, ltiContext: any): Response | Promise<Response> => {

    const { al, tl, skill, hidevspt, hidesa, hidevsptresult, hidefeedbackmenu } = ltiContext.context.custom;

    if (!al) {
      return c.redirect("/content/als.html");
    }

    const sessionId = setSessionId(c);

    const session = {
      id: sessionId,
      al,
      user: ltiContext.context.user,
      contextId: ltiContext.context.contextId,
      referrer: c.req.header("Referer"),
      ipAddress: getConnInfo(c).remote.address,
      started: Date.now(),
    };

    if (tl) {
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
