import { HttpError, json, readJson } from "../../../server/http.js";
import { enforceRateLimit } from "../../../server/rateLimit.js";
import { MAX_MAPS_PER_OWNER, toResource } from "../../../server/starMaps.js";
import { verifyTurnstile } from "../../../server/turnstile.js";
import { parseStarMap } from "../../../server/validation.js";

export const onRequestGet = async ({ env, data }) => {
  const { results } = await env.DB.prepare(
    "SELECT * FROM star_maps WHERE owner_id = ?1 ORDER BY created_at DESC LIMIT ?2",
  )
    .bind(data.ownerId, MAX_MAPS_PER_OWNER)
    .all();

  return json(results.map(toResource));
};

export const onRequestPost = async (context) => {
  const { request, env, data } = context;

  await enforceRateLimit(context, "write");

  const map = parseStarMap(await readJson(request));

  await verifyTurnstile(context);

  const { total } = await env.DB.prepare(
    "SELECT COUNT(*) AS total FROM star_maps WHERE owner_id = ?1",
  )
    .bind(data.ownerId)
    .first();

  if (total >= MAX_MAPS_PER_OWNER) {
    throw new HttpError(409, "map_limit_reached");
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const row = await env.DB.prepare(
    `INSERT INTO star_maps
       (id, owner_id, location, date, time, latitude, longitude, timezone, settings, created_at, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?10)
     RETURNING *`,
  )
    .bind(
      id,
      data.ownerId,
      map.location,
      map.date,
      map.time,
      map.latitude,
      map.longitude,
      map.timezone,
      JSON.stringify(map.settings),
      now,
    )
    .first();

  return json(toResource(row), { status: 201 });
};
