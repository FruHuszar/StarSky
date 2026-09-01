/**
 * Helykeresés. A két nyilvános szolgáltatót (Photon, Nominatim) egyszerre
 * kérdezzük, és amelyik előbb ad találatot, azt mutatjuk - így a javaslatok
 * akkor is gyorsan megjelennek, ha az egyik szolgáltató lassú. A találatokat
 * lekérdezésenként megjegyezzük, hogy a visszagépelés azonnali legyen.
 */

import mockData from "../data/mock.json";

const PHOTON_URL = "https://photon.komoot.io/api/";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const TIMEZONE_URL = "https://api.open-meteo.com/v1/forecast";
const REQUEST_TIMEOUT = 3500;

const cache = new Map();

const withTimeout = (signal) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  signal?.addEventListener("abort", () => controller.abort());

  return { signal: controller.signal, done: () => clearTimeout(timer) };
};

const clean = (parts) =>
  parts
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter((part, index, all) => part && all.indexOf(part) === index);

const photonEntry = (feature, index) => {
  const p = feature.properties;
  const street = clean([p.street ?? p.name, p.housenumber]).join(" ");
  const title = p.name && p.name !== p.street ? p.name : street;

  return {
    id: `photon-${p.osm_id ?? index}-${index}`,
    name: title || p.city || p.country,
    detail: clean([
      street && street !== title ? street : null,
      clean([p.postcode, p.city ?? p.town ?? p.village ?? p.county]).join(" "),
      p.state,
      p.country,
    ]).join(", "),
    latitude: feature.geometry.coordinates[1],
    longitude: feature.geometry.coordinates[0],
    timeZone: null,
  };
};

const nominatimEntry = (result, index) => {
  const address = result.address ?? {};
  const street = clean([
    address.road ?? address.pedestrian ?? address.footway,
    address.house_number,
  ]).join(" ");
  const settlement =
    address.city ?? address.town ?? address.village ?? address.municipality;

  return {
    id: `nominatim-${result.place_id ?? index}`,
    name:
      result.name || street || settlement || result.display_name.split(",")[0],
    detail: clean([
      street && street !== result.name ? street : null,
      clean([address.postcode, settlement]).join(" "),
      address.state,
      address.country,
    ]).join(", "),
    latitude: Number(result.lat),
    longitude: Number(result.lon),
    timeZone: null,
  };
};

const fromPhoton = async (query, signal, bias) => {
  const request = withTimeout(signal);
  const near = bias
    ? `&lat=${bias.latitude}&lon=${bias.longitude}&zoom=12&location_bias_scale=0.4`
    : "";

  try {
    const response = await fetch(
      `${PHOTON_URL}?q=${encodeURIComponent(query)}&limit=8${near}`,
      { signal: request.signal },
    );

    if (!response.ok) {
      throw new Error(String(response.status));
    }

    const payload = await response.json();

    return (payload.features ?? []).map(photonEntry);
  } finally {
    request.done();
  }
};

const fromNominatim = async (query, signal, bias) => {
  const request = withTimeout(signal);

  try {
    const response = await fetch(
      `${NOMINATIM_URL}?format=jsonv2&addressdetails=1&limit=8&accept-language=hu&countrycodes=${bias?.countryCode ?? ""}&q=${encodeURIComponent(query)}`,
      { signal: request.signal, headers: { Accept: "application/json" } },
    );

    if (!response.ok) {
      throw new Error(String(response.status));
    }

    return (await response.json()).map(nominatimEntry);
  } finally {
    request.done();
  }
};

const fromMock = (query) => {
  const needle = query.trim().toLowerCase();

  return mockData.cities
    .filter((city) => city.location.toLowerCase().includes(needle))
    .map((city) => ({
      id: `mock-${city.location}`,
      name: city.location,
      detail: "Magyarország",
      latitude: city.latitude,
      longitude: city.longitude,
      timeZone: city.timeZone,
    }));
};

/** Az első szolgáltató nyer, aki találatot ad; a többit nem várjuk meg. */
const race = (query, signal, bias) =>
  new Promise((resolve) => {
    const providers = [fromPhoton, fromNominatim];
    let pending = providers.length;

    providers.forEach((provider) => {
      provider(query, signal, bias)
        .then((results) => {
          if (results.length > 0) {
            resolve(results);
          }

          pending -= 1;

          if (pending === 0) {
            resolve([]);
          }
        })
        .catch(() => {
          pending -= 1;

          if (pending === 0) {
            resolve([]);
          }
        });
    });
  });

export const suggestLocations = async (query, signal, bias) => {
  const key = query.trim().toLowerCase();

  if (key.length < 3) {
    return { results: [], isOffline: false };
  }

  if (cache.has(key)) {
    return { results: cache.get(key), isOffline: false };
  }

  const results = await race(query, signal, bias);

  if (results.length > 0) {
    cache.set(key, results);

    return { results, isOffline: false };
  }

  const fallback = fromMock(query);

  return { results: fallback, isOffline: fallback.length === 0 };
};

export const resolveTimeZone = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `${TIMEZONE_URL}?latitude=${latitude}&longitude=${longitude}&timezone=auto&forecast_days=1`,
    );
    const payload = await response.json();

    return payload.timezone ?? null;
  } catch {
    return null;
  }
};

export const searchLocation = async (query) => {
  const { results } = await suggestLocations(query);
  const [first] = results;

  if (!first) {
    return null;
  }

  return {
    location: first.name,
    latitude: first.latitude,
    longitude: first.longitude,
    timeZone:
      first.timeZone ??
      (await resolveTimeZone(first.latitude, first.longitude)),
  };
};
