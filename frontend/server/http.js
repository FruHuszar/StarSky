const MAX_BODY_BYTES = 32 * 1024;

export class HttpError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export const json = (data, init = {}) =>
  Response.json(data, {
    ...init,
    headers: { "Cache-Control": "no-store", ...init.headers },
  });

export const noContent = () =>
  new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export const readJson = async (request) => {
  if (!request.headers.get("Content-Type")?.startsWith("application/json")) {
    throw new HttpError(415, "unsupported_media_type");
  }

  const text = await request.text();

  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new HttpError(413, "payload_too_large");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "invalid_json");
  }
};

export const sha256 = async (value) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const clientIp = (request) =>
  request.headers.get("CF-Connecting-IP") ?? "unknown";
