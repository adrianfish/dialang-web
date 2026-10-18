import type { Context } from "hono";
import { Storage } from "../storage/storage.ts";

const CONTENT_TYPES: Record<string, string> = {
  json: "application/json",
  html: "text/html; charset=utf-8",
};

export async function content(c: Context): Promise<Response> {

  // Key is the pathname minus the leading slash, e.g. "content/foo/bar.json".
  // Decode so %20 etc. match the keys rclone wrote.
  let key: string;
  try {
    key = decodeURIComponent(new URL(c.req.url).pathname.slice(1));
  } catch {
    return c.text("Bad request", 400);
  }

  // Reject path traversal and empty keys
  if (key.split("/").includes("..") || key === "content/" || key === "images/") {
    return c.text("Not found", 404);
  }

  const object = await c.env.BUCKET.get(key, {
    onlyIf: c.req.raw.headers, // handles If-None-Match / If-Modified-Since
    range: c.req.raw.headers,  // handles Range requests
  });

  if (object === null) return c.text("Not found", 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=3600");

  // Fall back to the extension if the object has no stored content-type
  if (!headers.has("content-type")) {
    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    headers.set("content-type", CONTENT_TYPES[ext] ?? "application/octet-stream");
  }

  // With onlyIf, a failed precondition returns an object with no body -> 304
  if (!("body" in object) || object.body === undefined) {
    return new Response(null, { status: 304, headers });
  }

  const status = c.req.header("range") ? 206 : 200;
  return new Response(c.req.method === "HEAD" ? null : object.body, {
    status,
    headers,
  });
}

