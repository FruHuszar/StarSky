import {
  DEFAULT_STONE,
  JEWELRY_TYPES,
  METALS,
  PLACEMENTS,
  STONES,
} from "../data/jewelry.js";

const CHAIN = { x: [64, 104, 168, 200], y: [0, 92, 122, 128] };
const PENDANT_SLOTS = [0.6, 0.45, 0.32];
const BRACELET_ANGLES = [40, 140, 25, 155, 55, 125];
const RING_ANGLES = [200, 340, 188, 352, 214, 326];
const EARRING_FACES = [122, 278];
const DEG = Math.PI / 180;

export const typeById = (id) =>
  JEWELRY_TYPES.find((type) => type.id === id) ?? JEWELRY_TYPES[0];

export const metalById = (id) =>
  METALS.find((metal) => metal.id === id) ?? METALS[0];

export const stoneByName = (name) =>
  STONES.find((stone) => stone.name === name) ??
  STONES.find((stone) => stone.name === DEFAULT_STONE);

export const placementsFor = (type) => [
  ...PLACEMENTS,
  { id: "charm", label: type.charmLabel, hint: type.charmHint },
];

export const resolveStone = (star, entry = {}) => ({
  star,
  stone: stoneByName(entry.gem ?? DEFAULT_STONE),
  placement: entry.placement ?? "map",
  isLocked: Boolean(entry.isLocked),
});

export const metalStyle = (metal) => ({
  "--metal-light": metal.tones.light,
  "--metal": metal.tones.base,
  "--metal-dark": metal.tones.dark,
  "--starmap-ring": metal.tones.base,
  "--starmap-label": metal.tones.base,
  "--starmap-gem": metal.tones.base,
  "--starmap-gem-core": metal.tones.light,
});

export const sizeLabel = (type, sizeId) =>
  type.sizes.find((size) => size.id === sizeId)?.label ?? null;

const bezier = ([a, b, c, d], t) => {
  const u = 1 - t;

  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

const onEllipse = (cx, cy, rx, ry, angle) => ({
  x: cx + rx * Math.cos(angle * DEG),
  y: cy + ry * Math.sin(angle * DEG),
});

const pendantCharm = (index) => {
  const t = PENDANT_SLOTS[Math.floor(index / 2)];
  const x = bezier(CHAIN.x, t);
  const anchor = { x: index % 2 ? 400 - x : x, y: bezier(CHAIN.y, t) };

  return { anchor, at: { x: anchor.x, y: anchor.y + 20 }, d: 22 };
};

const braceletCharm = (index) => {
  const anchor = onEllipse(200, 196, 178, 84, BRACELET_ANGLES[index]);

  return { anchor, at: { x: anchor.x, y: anchor.y + 18 }, d: 22 };
};

const ringCharm = (index) => {
  const at = onEllipse(200, 262, 108, 112, RING_ANGLES[index]);

  return { anchor: at, at, d: 20 };
};

export const charmLayout = (type, stones) => {
  if (type === "earrings") {
    return EARRING_FACES.flatMap((x) =>
      stones.map((entry, index) => {
        const anchor = { x, y: 306 };
        const offset = (index - (stones.length - 1) / 2) * 24;

        return {
          ...entry,
          key: `${x}-${entry.star}`,
          anchor,
          at: { x: x + offset, y: anchor.y + 26 },
          d: 18,
        };
      }),
    );
  }

  const place = { pendant: pendantCharm, bracelet: braceletCharm }[type];

  return stones.map((entry, index) => ({
    ...entry,
    key: entry.star,
    ...(place ?? ringCharm)(index),
  }));
};

const formatCoordinate = (value, positive, negative) =>
  `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;

export const engravingDetails = (view) => ({
  place: view.location,
  date: `${view.date.split("-").join(". ")}.`,
  coordinates: `${formatCoordinate(view.latitude, "É", "D")}, ${formatCoordinate(view.longitude, "K", "Ny")}`,
});
