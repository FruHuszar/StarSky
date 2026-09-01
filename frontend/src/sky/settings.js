/**
 * A csillagtérkép megjelenítési beállításai.
 *
 * Ugyanez a szerkezet utazik az API felé (settings mező), így egy
 * mentett térkép pontosan úgy nyílik meg, ahogy elmentették.
 */

export const LAYERS = [
  { key: "showConstellations", label: "Csillagképek" },
  { key: "showConstellationNames", label: "Csillagkép nevek" },
  { key: "showStarNames", label: "Csillagnevek" },
  { key: "showPlanets", label: "Bolygók" },
  { key: "showSun", label: "Nap" },
  { key: "showMoon", label: "Hold" },
  { key: "showMilkyWay", label: "Tejút" },
  { key: "showEcliptic", label: "Ekliptika" },
  { key: "showGrid", label: "Koordináta-rács" },
  { key: "showCircumpolar", label: "Sosem nyugvó kör" },
  { key: "showCardinals", label: "Égtájak" },
];

export const MAGNITUDE_RANGE = { minimum: 2.5, maximum: 6.5, step: 0.1 };

export const CUSTOM_TEXT_LIMIT = 120;

export const MAX_FAVOURITE_STARS = 5;

export const DEFAULT_SETTINGS = {
  time: "22:00",
  magnitudeLimit: 5.2,
  favouriteStars: [],
  bookEntries: [],
  customText: "",
  showConstellations: true,
  showConstellationNames: false,
  showStarNames: false,
  showPlanets: true,
  showSun: true,
  showMoon: true,
  showMilkyWay: true,
  showEcliptic: false,
  showGrid: false,
  showCircumpolar: false,
  showCardinals: true,
};

const clampMagnitude = (value) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return DEFAULT_SETTINGS.magnitudeLimit;
  }

  return Math.min(
    MAGNITUDE_RANGE.maximum,
    Math.max(MAGNITUDE_RANGE.minimum, Math.round(number * 10) / 10),
  );
};

const isValidTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? "");

/** Ismeretlen kulcsok nélkül, hiányzó mezők alapértelmezéssel. */
export const normaliseSettings = (values = {}) => {
  const settings = { ...DEFAULT_SETTINGS };

  LAYERS.forEach(({ key }) => {
    if (key in values) {
      settings[key] = Boolean(values[key]);
    }
  });

  if (isValidTime(values.time)) {
    settings.time = values.time;
  }

  if (values.magnitudeLimit !== undefined && values.magnitudeLimit !== null) {
    settings.magnitudeLimit = clampMagnitude(values.magnitudeLimit);
  }

  const favourites = Array.isArray(values.favouriteStars)
    ? values.favouriteStars
    : [values.favouriteStars];

  settings.favouriteStars = favourites
    .map((name) => String(name ?? "").trim())
    .filter((name, index, all) => name && all.indexOf(name) === index)
    .slice(0, MAX_FAVOURITE_STARS);

  settings.bookEntries = (
    Array.isArray(values.bookEntries) ? values.bookEntries : []
  )
    .filter((entry) => entry && entry.text)
    .map((entry) => ({
      star: entry.star ? String(entry.star).slice(0, 60) : null,
      label: String(entry.label ?? "").slice(0, 80),
      text: String(entry.text ?? "").slice(0, 2000),
    }));

  settings.customText = String(values.customText ?? "").slice(
    0,
    CUSTOM_TEXT_LIMIT,
  );

  return settings;
};

/** Mentett rekord -> beállítások (az időpont a térkép saját mezője). */
export const settingsFromRecord = (record) =>
  normaliseSettings({
    ...(record.settings ?? {}),
    time: record.time,
  });

/** A pillanat és a megjelenés együtt, ahogy az API várja. */
export const toStarMapPayload = (view, settings) => {
  const {
    time,
    customText,
    favouriteStars,
    bookEntries,
    magnitudeLimit,
    ...layers
  } = normaliseSettings(settings);

  return {
    location: view.location,
    date: view.date,
    time,
    latitude: view.latitude,
    longitude: view.longitude,
    timezone: view.timeZone ?? null,
    settings: {
      ...layers,
      magnitudeLimit,
      favouriteStars,
      bookEntries,
      customText: customText || null,
    },
  };
};
