import {
  CUSTOM_TEXT_LIMIT,
  LAYERS,
  MAGNITUDE_RANGE,
  MAX_FAVOURITE_STARS,
} from "../src/sky/settings.js";
import {
  LOCATION_PATTERN,
  STAR_NAME_PATTERN,
  cleanText,
} from "../shared/text.js";
import { HttpError } from "./http.js";

const MAX_BOOK_ENTRIES = 10;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const TIMEZONE_PATTERN = /^[A-Za-z_]+(\/[A-Za-z0-9_+-]+)*$/;

const reject = (field) => {
  throw new HttpError(422, `invalid_${field}`);
};

const text = (
  value,
  field,
  { max, pattern, multiline = false, optional = false },
) => {
  if (optional && (value === undefined || value === null)) {
    return null;
  }

  if (typeof value !== "string") {
    reject(field);
  }

  const normalised = value.normalize("NFC");
  const result = normalised.trim();

  if (optional && result === "") {
    return null;
  }

  if (
    cleanText(normalised, { multiline }) !== normalised ||
    result.length === 0 ||
    result.length > max ||
    (pattern && !pattern.test(result))
  ) {
    reject(field);
  }

  return result;
};

const number = (value, field, minimum, maximum) => {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum
  ) {
    reject(field);
  }

  return value;
};

const date = (value) => {
  const match = DATE_PATTERN.exec(typeof value === "string" ? value : "");

  if (!match) {
    reject("date");
  }

  const [, year, month, day] = match.map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    reject("date");
  }

  return value;
};

const time = (value) =>
  typeof value === "string" && TIME_PATTERN.test(value)
    ? value
    : reject("time");

const timeZone = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value !== "string" ||
    value.length > 64 ||
    !TIMEZONE_PATTERN.test(value)
  ) {
    reject("timezone");
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
  } catch {
    reject("timezone");
  }

  return value;
};

const list = (value, field, max) => {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value) || value.length > max) {
    reject(field);
  }

  return value;
};

const settings = (value) => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    reject("settings");
  }

  const result = {};

  LAYERS.forEach(({ key }) => {
    if (typeof value[key] !== "boolean") {
      reject(key);
    }

    result[key] = value[key];
  });

  result.magnitudeLimit = number(
    value.magnitudeLimit,
    "magnitudeLimit",
    MAGNITUDE_RANGE.minimum,
    MAGNITUDE_RANGE.maximum,
  );

  result.favouriteStars = list(
    value.favouriteStars,
    "favouriteStars",
    MAX_FAVOURITE_STARS,
  ).map((name) =>
    text(name, "favouriteStars", { max: 60, pattern: STAR_NAME_PATTERN }),
  );

  if (new Set(result.favouriteStars).size !== result.favouriteStars.length) {
    reject("favouriteStars");
  }

  result.bookEntries = list(
    value.bookEntries,
    "bookEntries",
    MAX_BOOK_ENTRIES,
  ).map((entry) => {
    if (entry === null || typeof entry !== "object") {
      reject("bookEntries");
    }

    return {
      star: text(entry.star, "bookEntries", {
        max: 60,
        pattern: STAR_NAME_PATTERN,
        optional: true,
      }),
      label: text(entry.label, "bookEntries", { max: 80 }),
      text: text(entry.text, "bookEntries", { max: 2000, multiline: true }),
    };
  });

  result.customText = text(value.customText, "customText", {
    max: CUSTOM_TEXT_LIMIT,
    multiline: true,
    optional: true,
  });

  return result;
};

export const parseStarMap = (body) => {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    reject("body");
  }

  return {
    location: text(body.location, "location", {
      max: 120,
      pattern: LOCATION_PATTERN,
    }),
    date: date(body.date),
    time: time(body.time),
    latitude: number(body.latitude, "latitude", -90, 90),
    longitude: number(body.longitude, "longitude", -180, 180),
    timezone: timeZone(body.timezone),
    settings: settings(body.settings),
  };
};
