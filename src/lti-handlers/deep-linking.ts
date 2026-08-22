import { deepLinkMenu } from "../templates/deep-link-menu.ts";

import type { Context } from "@hono";
import type { LTIContext } from "@adrianfish/deno-lti";

export const createDeepLinkingHandler = (storage: Storage) => {

  return async (c: Context, ltiContext: LTIContext): Response | Promise<Response> => {

    const { token } = ltiContext;

    const platformCode = c.get("platformCode");
    const contextId = token.platformContext.contextId;
    const user = token.user;

    const locale = token.userInfo.locale;

    let menu = await Deno.readTextFile(`./static/content/deep-linking-menu/${locale}.html`);
    menu = menu.replace("${platformCode}", platformCode);
    menu = menu.replace("${contextId}", contextId);
    menu = menu.replace("${user}", user);

    return c.html(menu);
  };
};
