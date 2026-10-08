import { cleanEngraving } from "../../shared/text.js";
import { engravingDetails } from "./jewelry.js";
import SkyModel from "./SkyModel.js";
import catalog from "./StarCatalog.js";
import { clipLine, densify } from "./sphere.js";

export const ORDER_SCHEMA_VERSION = 1;

const round = (value, digits = 4) => Number(value.toFixed(digits));

const project = ([north, east, up]) => {
  const factor = 1 / (1 + Math.max(up, -0.999));

  return [round(-east * factor), round(north * factor)];
};

const mapStars = (model, magnitudeLimit) =>
  model.visibleStars(magnitudeLimit).map((star) => {
    const [x, y] = project(star.vector);

    return { x, y, magnitude: round(star.apparentMagnitude, 2) };
  });

const constellationLines = (model) =>
  catalog.constellations.flatMap((constellation) =>
    constellation.lines.flatMap((line) =>
      clipLine(densify(line.map((vector) => model.toHorizon(vector)))).map(
        (segment) => segment.map(project),
      ),
    ),
  );

const stoneEntry = (model, { star, stone, placement, isLocked }) => {
  const entry = { star, gem: stone.id, placement, locked: isLocked };

  if (placement !== "map") {
    return entry;
  }

  const located = model.locateStar(star);

  if (!located) {
    return entry;
  }

  const [x, y] = project(located.vector);

  return { ...entry, x, y };
};

const engravingEntry = (view, engraving) => {
  const text = engraving.hasText ? cleanEngraving(engraving.text).trim() : "";

  return {
    text: text || null,
    details: engraving.hasDetails ? engravingDetails(view) : null,
  };
};

export const buildOrderFile = ({ view, settings, jewelry, stones }) => {
  const model = new SkyModel({
    latitude: view.latitude,
    longitude: view.longitude,
    date: view.date,
    time: settings.time,
    timeZone: view.timeZone,
  });

  return {
    schemaVersion: ORDER_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    sky: {
      location: view.location,
      date: view.date,
      time: settings.time,
      latitude: view.latitude,
      longitude: view.longitude,
      timezone: view.timeZone ?? null,
      magnitudeLimit: settings.magnitudeLimit,
    },
    projection: {
      type: "stereographic-zenith",
      radius: 1,
      orientation: "north-up-east-left",
    },
    jewelry: {
      type: jewelry.type,
      metal: jewelry.metal,
      size: jewelry.size,
    },
    stones: stones.map((entry) => stoneEntry(model, entry)),
    engraving: engravingEntry(view, jewelry.engraving),
    map: {
      stars: mapStars(model, settings.magnitudeLimit),
      constellationLines: settings.showConstellations
        ? constellationLines(model)
        : [],
    },
  };
};

const slug = (value) =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "terkep";

export const orderFileName = (view) =>
  `starsky-${view.date}-${slug(view.location)}.json`;
