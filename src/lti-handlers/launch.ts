import { getConnInfo } from '@hono/deno'
import { setSessionId } from "../utils/utils.ts";

import type { Context } from "@hono";
import type { StoredContextToken } from "@adrianfish/deno-lti";

export const createLTILaunchHandler = (storage: Storage) => {

  return (c: Context, ltiContext: any): Response | Promise<Response> => {

    const { al, tl, skill } = ltiContext.context.custom;

    if (!al) {
      return c.redirect("/content/als.html");
    }

    const sessionId = setSessionId(c);

    const session = {
      id: sessionId,
      al,
      referrer: c.req.header("Referer"),
      ipAddress: getConnInfo(c).remote.address,
      started: Date.now(),
    };

    if (tl) {
      session.tl = body.tl;
      session.skill = body.skill;
    }

    storage.saveSession(sessionId, session);

    return c.redirect("/content/launch.html");
  };
};
