import { sphericalToVector } from "../utils/astronomy.js";
import starData from "../data/stars.json";
import constellationData from "../data/constellations.json";
import milkyWayData from "../data/milkyway.json";

class StarCatalog {
  constructor(stars, constellations, milkyWay) {
    this.stars = stars;
    this.constellations = constellations;
    this.milkyWay = milkyWay;
  }

  static fromData(rawStars, rawConstellations, rawMilkyWay) {
    const stars = rawStars.stars
      .map(([rightAscension, declination, magnitude, colorIndex, name]) => ({
        vector: sphericalToVector(rightAscension, declination),
        magnitude,
        colorIndex,
        name: name ?? null,
      }))
      .sort((first, second) => first.magnitude - second.magnitude);

    const constellations = rawConstellations.constellations.map(
      (constellation) => ({
        id: constellation.id,
        la: constellation.la,
        hu: constellation.hu,
        rank: constellation.rank,
        anchorVector: sphericalToVector(...constellation.anchor),
        lines: constellation.lines.map((line) =>
          line.map(([rightAscension, declination]) =>
            sphericalToVector(rightAscension, declination),
          ),
        ),
      }),
    );

    const milkyWay = rawMilkyWay.levels.map((level) => ({
      level: level.level,
      rings: level.rings.map((ring) =>
        ring.map(([rightAscension, declination]) =>
          sphericalToVector(rightAscension, declination),
        ),
      ),
    }));

    return new StarCatalog(stars, constellations, milkyWay);
  }

  /** A csillagkép-vonalak végpontjai, hogy egy vonal soha ne érjen a semmibe. */
  constellationStarKeys() {
    if (!this.figureKeys) {
      this.figureKeys = new Set();

      this.constellations.forEach((constellation) => {
        constellation.lines.forEach((line) => {
          line.forEach((vector) => this.figureKeys.add(vectorKey(vector)));
        });
      });
    }

    return this.figureKeys;
  }

  namedStars() {
    return this.stars.filter((star) => star.name);
  }
}

/** A katalógus és a vonalrajz külön forrásból jön, ezért pozíció alapján párosítunk. */
export const vectorKey = ([x, y, z]) =>
  `${x.toFixed(4)}|${y.toFixed(4)}|${z.toFixed(4)}`;

const catalog = StarCatalog.fromData(starData, constellationData, milkyWayData);

export default catalog;
