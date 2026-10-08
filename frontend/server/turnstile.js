import { HttpError, clientIp } from "./http.js";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const verifyTurnstile = async ({ request, env }) => {
  const token = request.headers.get("CF-Turnstile-Response");

  if (!env.TURNSTILE_SECRET_KEY) {
    throw new HttpError(500, "turnstile_not_configured");
  }

  if (!token || token.length > 2048) {
    throw new HttpError(403, "verification_required");
  }

  const body = new FormData();
  body.append("secret", env.TURNSTILE_SECRET_KEY);
  body.append("response", token);
  body.append("remoteip", clientIp(request));

  const outcome = await fetch(SITEVERIFY_URL, {
    method: "POST",
    body,
    signal: AbortSignal.timeout(5000),
  })
    .then((response) => response.json())
    .catch(() => {
      throw new HttpError(503, "verification_unavailable");
    });

  if (!outcome.success) {
    throw new HttpError(403, "verification_failed");
  }
};
