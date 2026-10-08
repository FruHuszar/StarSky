import { json } from "../../server/http.js";
import { findTimeZone } from "../../server/geocode.js";
import { enforceRateLimit } from "../../server/rateLimit.js";

export const onRequestGet = async (context) => {
  await enforceRateLimit(context, "geocode");

  const timeZone = await findTimeZone(
    new URL(context.request.url).searchParams,
  );

  return json(
    { timeZone },
    { headers: { "Cache-Control": "public, max-age=604800" } },
  );
};
