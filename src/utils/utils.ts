import { getCookie, setCookie } from "hono/cookie";
import { SessionDO } from "../session-do.ts";

import type { Context } from "hono";

export function setSessionId(c: Context): string {

  const sessionId = crypto.randomUUID();
  const maxAge = 8 * 60 * 60 * 1000;
  setCookie(c, "dialang", sessionId, { maxAge, sameSite: "None", secure: true, httpOnly: true } );
  return sessionId;
}

export function getSessionId(c: Context): string | undefined {
  return getCookie(c, "dialang");
}

export function getSession(c: Context): SessionDO | null {

  const sessionId: string | undefined = getSessionId(c);
  if (!sessionId) return null;
  return getSessionFromId(c, sessionId);
}

export function getSessionFromId(c: Context, sessionId: string): SessionDO | null {
  return c.env.SESSION.get(c.env.SESSION.idFromName(sessionId));
}

export function forceSessionId(c: Context, sessionId: string): string {

  const maxAge = 8 * 60 * 60 * 1000;
  setCookie(c, "dialang", sessionId, { maxAge, sameSite: "None", secure: true, httpOnly: true } );
  return sessionId;
}

export async function createHash(message: string): Promise<string> {

  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", data)).toHex();
}

export function loggedIntoReports(c: Context): boolean {
  return !!getCookie(c, "dialang-reports");
}

