import { HttpError, clientIp, sha256 } from "./http.js";

const WINDOW_SECONDS = 60;

export const LIMITS = {
  write: 20,
  geocode: 60,
};

export const enforceRateLimit = async (context, scope) => {
  const { request, env } = context;
  const bucket = `${scope}:${await sha256(clientIp(request))}`;
  const currentWindow = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);

  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (bucket, window_start, hits) VALUES (?1, ?2, 1)
     ON CONFLICT (bucket) DO UPDATE SET
       hits = CASE WHEN window_start = excluded.window_start THEN hits + 1 ELSE 1 END,
       window_start = excluded.window_start
     RETURNING hits`,
  )
    .bind(bucket, currentWindow)
    .first();

  context.waitUntil(
    env.DB.prepare("DELETE FROM rate_limits WHERE window_start < ?1")
      .bind(currentWindow - 5)
      .run(),
  );

  if (row.hits > LIMITS[scope]) {
    throw new HttpError(429, "too_many_requests");
  }
};
