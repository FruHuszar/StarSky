/**
 * A "Mi a szerencsecsillagom?" varázsló logikája.
 *
 * A dátumos út valódi számítás: a Nap és a Hold ekliptikai hosszúságához
 * legközelebbi fényes állócsillagot keresi meg az adott napon. A másik két
 * út hagyományon alapul, a szövegek is ekként fogalmaznak.
 */

import {
  moonPosition,
  obliquity,
  sunPosition,
  toJulianDay,
  vectorToSpherical,
  sphericalToVector,
  applyMatrix,
  precessionMatrix,
} from "../utils/astronomy.js";
import { toUtcInstant } from "../utils/timezone.js";
import {
  BEHENIAN_STARS,
  GEM_BY_COLOUR,
  MYTHOLOGY_STORIES,
  MYTHOLOGY_TRAITS,
} from "../data/starGuide.js";
import catalog from "./StarCatalog.js";

const DEG = Math.PI / 180;

const ZODIAC = [
  "Kos",
  "Bika",
  "Ikrek",
  "Rák",
  "Oroszlán",
  "Szűz",
  "Mérleg",
  "Skorpió",
  "Nyilas",
  "Bak",
  "Vízöntő",
  "Halak",
];

const toEcliptic = (vector, julianDay) => {
  const eps = obliquity(julianDay) * DEG;
  const [x, y, z] = vector;
  const rotated = [
    x,
    y * Math.cos(eps) + z * Math.sin(eps),
    -y * Math.sin(eps) + z * Math.cos(eps),
  ];
  const { longitude, latitude } = vectorToSpherical(rotated);

  return { longitude, latitude };
};

const angularDifference = (first, second) =>
  Math.abs(((first - second + 540) % 360) - 180);

const eclipticStars = (julianDay) => {
  const matrix = precessionMatrix(julianDay);

  return catalog
    .namedStars()
    .filter((star) => star.magnitude <= 3.2)
    .map((star) => {
      const ofDate = applyMatrix(matrix, star.vector);
      const { longitude, latitude } = toEcliptic(ofDate, julianDay);

      return { ...star, longitude, latitude };
    })
    .filter((star) => Math.abs(star.latitude) <= 14);
};

export const gemForStar = (star) => {
  const behenian = BEHENIAN_STARS.find((entry) => entry.star === star?.name);

  if (behenian) {
    return { gem: behenian.gem, isTraditional: true };
  }

  const colourIndex = star?.colorIndex ?? 0.5;
  const match =
    GEM_BY_COLOUR.find((entry) => colourIndex < entry.limit) ??
    GEM_BY_COLOUR[GEM_BY_COLOUR.length - 1];

  return { gem: match.gem, tone: match.tone, isTraditional: false };
};

const findStarByName = (name) =>
  catalog.namedStars().find((star) => star.name === name) ?? null;

/** Melyik állócsillaggal járt együtt a Nap az adott napon. */
export const findDateStar = ({ date, time, timeZone, longitude = 19.04 }) => {
  const instant = toUtcInstant({
    date,
    time: time || "12:00",
    timeZone,
    longitude,
  });
  const julianDay = toJulianDay(instant);
  const sun = sunPosition(julianDay);
  const moon = moonPosition(julianDay);
  const moonEcliptic = toEcliptic(
    sphericalToVector(moon.rightAscension, moon.declination),
    julianDay,
  );
  const stars = eclipticStars(julianDay);

  const nearest = (target) =>
    stars.reduce((best, star) => {
      const distance = angularDifference(star.longitude, target);

      return !best || distance < best.distance ? { star, distance } : best;
    }, null);

  const sunMatch = nearest(sun.longitude);
  const moonMatch = nearest(moonEcliptic.longitude);
  const sign = ZODIAC[Math.floor(sun.longitude / 30) % 12];

  return {
    julianDay,
    sunMatch,
    moonMatch,
    sign,
    moonIllumination: Math.round(moon.illumination * 100),
    moonWaxing: moon.waxing,
  };
};

const formatDate = (date) => date.split("-").join(". ") + ".";

const dateStory = (date, result) => {
  const sun = result.sunMatch;
  const moon = result.moonMatch;
  const phase = result.moonWaxing ? "növekvő" : "fogyó";

  return [
    `${formatDate(date)} a Nap a ${result.sign} jegyében járt, és az égen a ${sun.star.name} közelében állt (${sun.distance.toFixed(1)}° távolságra).`,
    `A Hold ezen a napon a ${moon.star.name} mellett haladt el, ${result.moonIllumination}%-ban megvilágítva, ${phase} fázisban.`,
    `Ez a csillag állt tehát együtt a Nappal azon a napon - ezt őrzi meg az ékszer.`,
  ].join(" ");
};

/** A varázsló eredménye. */
export const buildGuideResult = (path, answers) => {
  if (path === "behenian") {
    const entry =
      BEHENIAN_STARS.find((item) => item.effect === answers.effect) ??
      BEHENIAN_STARS[0];
    const alternatives = BEHENIAN_STARS.filter(
      (item) => item.effect === answers.effect && item.star !== entry.star,
    );

    return {
      path,
      starName: entry.star,
      constellation: entry.constellation,
      gem: entry.gem,
      isGemFixed: true,
      summary: entry.meaning,
      bookLabel: "A csillag hagyománya és javasolt párosításai",
      bookText: [
        `${entry.star} (${entry.latin}) – ${entry.constellation}.`,
        entry.meaning,
        `A hagyomány szerinti kő: ${entry.gem}. A hozzá rendelt növény: ${entry.herb}.`,
        alternatives.length > 0
          ? `Ugyanezt az erőt hordozza a hagyományban: ${alternatives
              .map((item) => `${item.star} (${item.gem})`)
              .join(", ")}.`
          : "",
        "A behéni hagyományban a csillag és a köve elválaszthatatlan, ezért ezen az úton a kő kötött.",
      ]
        .filter(Boolean)
        .join(" "),
    };
  }

  if (path === "mythology") {
    const trait =
      MYTHOLOGY_TRAITS.find((item) => item.id === answers.trait) ??
      MYTHOLOGY_TRAITS[0];

    return {
      path,
      starName: trait.star,
      constellation: trait.constellation,
      gem: trait.gem,
      isGemFixed: false,
      summary: trait.story.split(". ")[0] + ".",
      bookLabel: "A csillag mítosza",
      bookText: `${trait.star} – ${trait.constellation}. ${trait.story}`,
    };
  }

  const result = findDateStar(answers);
  const star = result.sunMatch.star;
  const { gem } = gemForStar(star);

  return {
    path,
    starName: star.name,
    constellation: null,
    gem,
    isGemFixed: false,
    summary: `${formatDate(answers.date)} a Nap a ${star.name} közelében állt, a ${result.sign} jegyében.`,
    bookLabel: "A nap égboltja",
    bookText: dateStory(answers.date, result),
    details: result,
  };
};

export const starDetails = (name) => findStarByName(name);

export const mythologyForStar = (name) =>
  MYTHOLOGY_STORIES.filter((story) => story.star === name);

export const behenianForStar = (name) =>
  BEHENIAN_STARS.find((entry) => entry.star === name) ?? null;

const signedDifference = (first, second) =>
  ((first - second + 540) % 360) - 180;

const isoFromDate = (date) => date.toISOString().slice(0, 10);

/** Azok a napok, amikor a Nap a csillag ekliptikai hosszúságába ért. */
export const sunConjunctionDates = (name, count = 8) => {
  const star = findStarByName(name);

  if (!star) {
    return [];
  }

  const today = new Date();
  const startJulianDay = toJulianDay(today);
  const matrix = precessionMatrix(startJulianDay);
  const starLongitude = toEcliptic(
    applyMatrix(matrix, star.vector),
    startJulianDay,
  ).longitude;

  const dates = [];
  let previous = null;

  for (let step = 0; step < count * 370 && dates.length < count; step += 1) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - step);

    const difference = signedDifference(
      sunPosition(toJulianDay(day)).longitude,
      starLongitude,
    );

    if (
      previous &&
      Math.sign(difference) !== Math.sign(previous.difference) &&
      Math.abs(difference) < 5
    ) {
      const closer =
        Math.abs(difference) < Math.abs(previous.difference)
          ? day
          : previous.day;
      dates.push(isoFromDate(closer));
    }

    previous = { day, difference };
  }

  return dates;
};

export const bookOptionsForStar = (name) => ({
  mythology: mythologyForStar(name),
  behenian: behenianForStar(name),
});

export const mythologyEntry = (name, storyIds) => {
  const stories = mythologyForStar(name).filter((story) =>
    storyIds.includes(story.id),
  );

  if (stories.length === 0) {
    return null;
  }

  return {
    star: name,
    label: `${name} – mítosz`,
    text: stories.map((story) => `${story.figure}. ${story.story}`).join(" "),
  };
};

export const behenianEntry = (name) => {
  const entry = behenianForStar(name);

  if (!entry) {
    return null;
  }

  return {
    star: name,
    label: `${name} – behéni hagyomány`,
    text: `${entry.star} (${entry.latin}) – ${entry.constellation}. ${entry.meaning} A hagyomány szerinti kő: ${entry.gem}. A hozzá rendelt növény: ${entry.herb}.`,
  };
};

export const dateEntry = (name, date) => ({
  star: name,
  label: `${name} – ${date}`,
  text: dateEntryText(name, date),
});

export const dateEntryText = (name, date) => {
  const star = findStarByName(name);
  const result = findDateStar({ date, time: "12:00" });
  const phase = result.moonWaxing ? "növekvő" : "fogyó";
  const magnitude = star ? ` (${star.magnitude.toFixed(1)} magnitúdó)` : "";

  return `${formatDate(date)} a Nap ugyanabban az ekliptikai hosszúságban állt, mint a ${name}${magnitude}. A Nap ekkor a ${result.sign} jegyében járt, a Hold ${result.moonIllumination}%-ban megvilágítva, ${phase} fázisban.`;
};
