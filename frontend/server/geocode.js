import { cleanText } from "../shared/text.js";
import { HttpError } from "./http.js";

const PHOTON_URL = "https://photon.komoot.io/api/";
const TIMEZONE_URL = "https://api.open-meteo.com/v1/forecast";
const TIMEOUT = 4000;
const USER_AGENT = "StarSky/1.0 (+https://starsky-jewelry.pages.dev)";

const coordinate = (value, limit) => {
  const parsed = Number(value);

  return value !== null && Number.isFinite(parsed) && Math.abs(parsed) <= limit
    ? parsed
    : null;
};

const unique = (parts) =>
  parts
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter((part, index, all) => part && all.indexOf(part) === index);

const toPlace = (feature) => {
  const p = feature.properties ?? {};
  const street = unique([p.street ?? p.name, p.housenumber]).join(" ");
  const title = p.name && p.name !== p.street ? p.name : street;
  const [longitude, latitude] = feature.geometry?.coordinates ?? [];

  return {
    id: `${p.osm_type ?? "x"}${p.osm_id ?? `${latitude},${longitude}`}`,
    name: cleanText(title || p.city || p.country).slice(0, 120),
    detail: cleanText(
      unique([
        street && street !== title ? street : null,
        unique([p.postcode, p.city ?? p.town ?? p.village ?? p.county]).join(
          " ",
        ),
        p.state,
        p.country,
      ]).join(", "),
    ).slice(0, 200),
    latitude,
    longitude,
  };
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT),
  }).catch(() => null);

  if (!response?.ok) {
    throw new HttpError(502, "upstream_error");
  }

  return response.json();
};

export const searchPlaces = async (params) => {
  const query = cleanText(params.get("q")).trim();

  if (query.length < 3 || query.length > 100) {
    throw new HttpError(422, "invalid_query");
  }

  const url = new URL(PHOTON_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "8");

  const latitude = coordinate(params.get("lat"), 90);
  const longitude = coordinate(params.get("lon"), 180);

  if (latitude !== null && longitude !== null) {
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("zoom", "12");
    url.searchParams.set("location_bias_scale", "0.4");
  }

  const payload = await fetchJson(url);

  return (payload.features ?? [])
    .map(toPlace)
    .filter(
      (place) =>
        place.name &&
        Number.isFinite(place.latitude) &&
        Number.isFinite(place.longitude),
    );
};

export const findTimeZone = async (params) => {
  const latitude = coordinate(params.get("lat"), 90);
  const longitude = coordinate(params.get("lon"), 180);

  if (latitude === null || longitude === null) {
    throw new HttpError(422, "invalid_coordinates");
  }

  const url = new URL(TIMEZONE_URL);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  const payload = await fetchJson(url);

  return typeof payload.timezone === "string" ? payload.timezone : null;
};
