import mockData from "../data/mock.json";

const REQUEST_TIMEOUT = 5000;

const cache = new Map();

const getJson = async (path, params, signal) => {
  const response = await fetch(`${path}?${new URLSearchParams(params)}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.any(
      [signal, AbortSignal.timeout(REQUEST_TIMEOUT)].filter(Boolean),
    ),
  });

  if (!response.ok) {
    throw new Error(String(response.status));
  }

  return response.json();
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

const fromApi = async (query, signal, bias) => {
  const params = { q: query.trim() };

  if (bias) {
    params.lat = bias.latitude;
    params.lon = bias.longitude;
  }

  const places = await getJson("/api/geocode", params, signal);

  return places.map((place) => ({ ...place, timeZone: null }));
};

export const suggestLocations = async (query, signal, bias) => {
  const key = query.trim().toLowerCase();

  if (key.length < 3) {
    return { results: [], isOffline: false };
  }

  if (cache.has(key)) {
    return { results: cache.get(key), isOffline: false };
  }

  const results = await fromApi(query, signal, bias).catch((error) => {
    if (signal?.aborted) {
      throw error;
    }

    return [];
  });

  if (results.length > 0) {
    cache.set(key, results);

    return { results, isOffline: false };
  }

  const fallback = fromMock(query);

  return { results: fallback, isOffline: fallback.length === 0 };
};

export const resolveTimeZone = async (latitude, longitude) => {
  try {
    const { timeZone } = await getJson("/api/timezone", {
      lat: latitude,
      lon: longitude,
    });

    return timeZone;
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
