import { HttpError, json, noContent, readJson } from "../../../server/http.js";
import { enforceRateLimit } from "../../../server/rateLimit.js";
import { findOwnedMap, toResource } from "../../../server/starMaps.js";
import { verifyTurnstile } from "../../../server/turnstile.js";
import { parseStarMap } from "../../../server/validation.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const requireOwnedMap = async ({ env, params, data }) => {
  const map = UUID_PATTERN.test(params.id)
    ? await findOwnedMap(env.DB, params.id, data.ownerId)
    : null;

  if (!map) {
    throw new HttpError(404, "not_found");
  }

  return map;
};

export const onRequestPut = async (context) => {
  const { request, env } = context;

  await enforceRateLimit(context, "write");

  const current = await requireOwnedMap(context);
  const map = parseStarMap(await readJson(request));

  await verifyTurnstile(context);

  const row = await env.DB.prepare(
    `UPDATE star_maps SET
       location = ?1, date = ?2, time = ?3, latitude = ?4, longitude = ?5,
       timezone = ?6, settings = ?7, updated_at = ?8
     WHERE id = ?9 AND owner_id = ?10
     RETURNING *`,
  )
    .bind(
      map.location,
      map.date,
      map.time,
      map.latitude,
      map.longitude,
      map.timezone,
      JSON.stringify(map.settings),
      new Date().toISOString(),
      current.id,
      current.owner_id,
    )
    .first();

  return json(toResource(row));
};

export const onRequestDelete = async (context) => {
  await enforceRateLimit(context, "write");

  const current = await requireOwnedMap(context);

  await context.env.DB.prepare(
    "DELETE FROM star_maps WHERE id = ?1 AND owner_id = ?2",
  )
    .bind(current.id, current.owner_id)
    .run();

  return noContent();
};
