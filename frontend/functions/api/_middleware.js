import { HttpError, json } from "../../server/http.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
};

const isSameOrigin = (request) => {
  const origin = request.headers.get("Origin");

  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
};

const handle = async (context) => {
  const { request } = context;

  if (!SAFE_METHODS.has(request.method) && !isSameOrigin(request)) {
    throw new HttpError(403, "forbidden_origin");
  }

  return context.next();
};

export const onRequest = async (context) => {
  let response;

  try {
    response = await handle(context);
  } catch (error) {
    if (!(error instanceof HttpError)) {
      console.error(error);
    }

    response =
      error instanceof HttpError
        ? json({ error: error.code }, { status: error.status })
        : json({ error: "server_error" }, { status: 500 });
  }

  const secured = new Response(response.body, response);

  Object.entries(SECURITY_HEADERS).forEach(([name, value]) =>
    secured.headers.set(name, value),
  );

  return secured;
};
