import { json } from "../../server/http.js";
import { searchPlaces } from "../../server/geocode.js";
import { enforceRateLimit } from "../../server/rateLimit.js";

export const onRequestGet = async (context) => {
  await enforceRateLimit(context, "geocode");

  const places = await searchPlaces(new URL(context.request.url).searchParams);

  return json(places, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
};
