import type { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Errors thrown by Durable Object methods reach the Worker over RPC, where
 * custom error classes lose their identity but keep their message. So known
 * application errors are matched on the message text. Keep these strings in
 * sync with the `throw new Error(...)` calls in the Durable Object.
 */
const KNOWN_ERRORS: Record<string, { status: ContentfulStatusCode; code: string }> = {
  "Session not found": { status: 404, code: "session_not_found" },
  "Session is already complete": { status: 409, code: "session_complete" },
};

type ErrorBody = { code: string; message: string };

/**
 * Register on the top-level app: app.onError(errorHandler)
 *
 * Responses never include stack traces or internal messages for 5xx errors.
 * Logs never include request bodies, headers or query strings, because those
 * can contain learners' answers and other personal data.
 */
export const errorHandler: ErrorHandler = (err, c) => {

  const requestId = c.req.header("cf-ray") ?? crypto.randomUUID();
  c.header("X-Request-Id", requestId);

  const respond = (status: ContentfulStatusCode, code: string, message: string) =>
    c.json<ErrorBody>({ code, message }, status);

  const logBase = { requestId, method: c.req.method, path: c.req.path };

  // 1. Errors thrown deliberately with `throw new HTTPException(...)`.
  if (err instanceof HTTPException) {
    const status = err.status;
    const entry = { event: "http_exception", ...logBase, status, error: err.message };
    if (status >= 500) {
      console.error(entry);
      return respond(status, "server_error", "Something went wrong");
    }
    console.warn(entry);
    return respond(status, "request_error", err.message);
  }

  // 2. Known application errors that came back from a Durable Object.
  const known = KNOWN_ERRORS[err.message];
  if (known) {
    console.warn({ event: "app_error", ...logBase, status: known.status, code: known.code });
    return respond(known.status, known.code, err.message);
  }

  // 3. Malformed JSON in a request body (from c.req.json()).
  if (err instanceof SyntaxError && /json/i.test(err.message)) {
    console.warn({ event: "invalid_json", ...logBase });
    return respond(400, "invalid_json", "Request body is not valid JSON");
  }

  // 4. Durable Object overload or other retryable platform failures.
  const platform = err as Error & { overloaded?: boolean; retryable?: boolean };
  if (platform.overloaded || platform.retryable) {
    console.error({
      event: "platform_unavailable",
      ...logBase,
      overloaded: Boolean(platform.overloaded),
      error: err.message,
    });
    c.header("Retry-After", "2");
    return respond(503, "unavailable", "Service temporarily unavailable, please retry");
  }

  // 5. Anything else is a bug: log the detail, tell the client nothing.
  console.error({
    event: "unhandled_error",
    ...logBase,
    error: err.message,
    stack: err.stack,
  });

  return respond(500, "server_error", "Something went wrong");
};

export const notFoundHandler: NotFoundHandler = (c) =>
  c.json<ErrorBody>({ code: "not_found", message: "Not found" }, 404);
