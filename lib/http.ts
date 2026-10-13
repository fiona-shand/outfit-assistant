import { NextResponse } from "next/server";

/** Wraps a route handler so thrown errors become JSON `{ error }` responses. */
export function route<A extends unknown[]>(fn: (...args: A) => Promise<Response | unknown>) {
  return async (...args: A): Promise<Response> => {
    try {
      const result = await fn(...args);
      return result instanceof Response ? result : NextResponse.json(result ?? { ok: true });
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : typeof err === "object" && err && "message" in err ? String(err.message) : "Something went wrong";
      return NextResponse.json({ error: message }, { status: err instanceof HttpError ? err.status : 500 });
    }
  };
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Strip a `data:image/...;base64,` prefix if present. */
export function stripDataUrl(s: string): string {
  const i = s.indexOf("base64,");
  return i >= 0 ? s.slice(i + 7) : s;
}
