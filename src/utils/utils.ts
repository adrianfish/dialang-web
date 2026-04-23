import { getCookie, setCookie } from "@hono/cookie";
import type { Context } from "@hono";

export function setSessionId(c: Context): string {

  const sessionId = crypto.randomUUID();
  const maxAge = 8 * 60 * 60 * 1000;
  setCookie(c, "dialang", sessionId, { maxAge } );
  return sessionId;
}

export function getSessionId(c: Context): string {
  return getCookie(c, "dialang");
}

export async function createHash(message: string): string {

  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", data)).toHex();
}

