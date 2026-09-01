/**
 * Egy adott hely és pillanat égboltja: a katalógus vektorai horizontális
 * koordinátákba forgatva, a Nappal, a Holddal és a bolygókkal együtt.
 *
 * A locateStar egy nevesített csillag helyét adja vissza a korongon. Ha a
 * csillag a választott időpontban a horizont alatt jár, de a Naptól legfeljebb
 * 90°-ra áll, akkor aznap a Nappal együtt volt fent: ilyenkor a delelése
 * (óraszög = 0) kerül vissza, isDaylight jelzéssel.
 */

import {
  applyMatrix,
  eclipticPath,
  extinctionMagnitudes,
  localSiderealTime,
  moonPosition,
  planetPositions,
  precessionMatrix,
  refractedAltitude,
  sphericalToVector,
  sunPosition,
  toJulianDay,
  topocentricAltitude,
  vectorToSpherical,
} from "../utils/astronomy.js";
import { formatOffset, toUtcInstant } from "../utils/timezone.js";
import catalog, { vectorKey } from "./StarCatalog.js";

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

class SkyModel {
  constructor({ latitude, longitude, date, time, timeZone }) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.date = date;
    this.time = time;
    this.timeZone = timeZone ?? null;

    this.instant = toUtcInstant({ date, time, timeZone, longitude });
    this.julianDay = toJulianDay(this.instant);
    this.siderealTime = localSiderealTime(this.julianDay, longitude);
    this.precession = precessionMatrix(this.julianDay);
    this.matrix = this.createSkyMatrix();

    this.sun = this.describeSun();
    this.moon = this.describeMoon();
    this.planets = this.describePlanets();
  }

  get utcOffsetLabel() {
    return formatOffset(this.timeZone, this.instant, this.longitude);
  }

  createSkyMatrix() {
    const precession = this.precession;
    const sinLat = Math.sin(this.latitude * DEG);
    const cosLat = Math.cos(this.latitude * DEG);
    const sinLst = Math.sin(this.siderealTime * DEG);
    const cosLst = Math.cos(this.siderealTime * DEG);

    const horizontal = [
      [-sinLat * cosLst, -sinLat * sinLst, cosLat],
      [-sinLst, cosLst, 0],
      [cosLat * cosLst, cosLat * sinLst, sinLat],
    ];

    return horizontal.map((row) =>
      precession[0].map((_, column) =>
        row.reduce(
          (sum, value, index) => sum + value * precession[index][column],
          0,
        ),
      ),
    );
  }

  toHorizon(vector) {
    const matrix = this.matrix;

    return [
      matrix[0][0] * vector[0] +
        matrix[0][1] * vector[1] +
        matrix[0][2] * vector[2],
      matrix[1][0] * vector[0] +
        matrix[1][1] * vector[1] +
        matrix[1][2] * vector[2],
      matrix[2][0] * vector[0] +
        matrix[2][1] * vector[1] +
        matrix[2][2] * vector[2],
    ];
  }

  horizonFromEquatorial(rightAscension, declination) {
    const hourAngle = (this.siderealTime - rightAscension) * DEG;
    const sinDec = Math.sin(declination * DEG);
    const cosDec = Math.cos(declination * DEG);
    const sinLat = Math.sin(this.latitude * DEG);
    const cosLat = Math.cos(this.latitude * DEG);

    return [
      sinDec * cosLat - cosDec * sinLat * Math.cos(hourAngle),
      -cosDec * Math.sin(hourAngle),
      sinDec * sinLat + cosDec * cosLat * Math.cos(hourAngle),
    ];
  }

  altitudeOf([, , up]) {
    return Math.asin(Math.max(-1, Math.min(1, up))) * RAD;
  }

  azimuthOf([north, east]) {
    return (Math.atan2(east, north) * RAD + 360) % 360;
  }

  refract(vector) {
    if (vector[2] > 0.09 || vector[2] < -0.02) {
      return vector;
    }

    const apparent = refractedAltitude(this.altitudeOf(vector));
    const horizontal = Math.hypot(vector[0], vector[1]) || 1;
    const factor = Math.cos(apparent * DEG) / horizontal;

    return [vector[0] * factor, vector[1] * factor, Math.sin(apparent * DEG)];
  }

  describeSun() {
    const position = sunPosition(this.julianDay);
    const vector = this.horizonFromEquatorial(
      position.rightAscension,
      position.declination,
    );

    return {
      ...position,
      vector,
      altitude: this.altitudeOf(vector),
      azimuth: this.azimuthOf(vector),
    };
  }

  describeMoon() {
    const position = moonPosition(this.julianDay);
    const geocentric = this.horizonFromEquatorial(
      position.rightAscension,
      position.declination,
    );
    const altitude = topocentricAltitude(
      this.altitudeOf(geocentric),
      position.distance,
    );
    const horizontal = Math.hypot(geocentric[0], geocentric[1]) || 1;
    const factor = Math.cos(altitude * DEG) / horizontal;
    const vector = this.refract([
      geocentric[0] * factor,
      geocentric[1] * factor,
      Math.sin(altitude * DEG),
    ]);

    return {
      ...position,
      vector,
      altitude: this.altitudeOf(vector),
      azimuth: this.azimuthOf(vector),
      isVisible: vector[2] > 0,
    };
  }

  describePlanets() {
    return planetPositions(this.julianDay).map((planet) => {
      const vector = this.refract(
        this.horizonFromEquatorial(planet.rightAscension, planet.declination),
      );
      const altitude = this.altitudeOf(vector);

      return {
        ...planet,
        vector,
        altitude,
        azimuth: this.azimuthOf(vector),
        apparentMagnitude:
          planet.magnitude + Math.max(0, extinctionMagnitudes(altitude)),
        isVisible: vector[2] > 0,
      };
    });
  }

  equatorialOfDate(vector) {
    const { longitude, latitude } = vectorToSpherical(
      applyMatrix(this.precession, vector),
    );

    return { rightAscension: longitude, declination: latitude };
  }

  culmination(vector) {
    const { rightAscension, declination } = this.equatorialOfDate(vector);
    const separation = Math.abs(
      ((rightAscension - this.sun.rightAscension + 540) % 360) - 180,
    );

    if (separation > 90) {
      return null;
    }

    const horizon = this.refract(
      this.horizonFromEquatorial(this.siderealTime, declination),
    );

    return horizon[2] > 0 ? horizon : null;
  }

  locateStar(name) {
    const star = catalog.namedStars().find((item) => item.name === name);

    if (!star) {
      return null;
    }

    const current = this.refract(this.toHorizon(star.vector));

    if (current[2] > 0) {
      return { star, vector: current, isDaylight: false };
    }

    const daylight = this.culmination(star.vector);

    return daylight ? { star, vector: daylight, isDaylight: true } : null;
  }

  visibleStars(magnitudeLimit) {
    const figureKeys = catalog.constellationStarKeys();
    const visible = [];

    for (const star of catalog.stars) {
      if (star.magnitude > magnitudeLimit + 3) {
        break;
      }

      const raw = this.toHorizon(star.vector);

      if (raw[2] < -0.02) {
        continue;
      }

      const vector = this.refract(raw);

      if (vector[2] < 0) {
        continue;
      }

      const altitude = this.altitudeOf(vector);
      const extinction = Math.max(0, extinctionMagnitudes(altitude));
      const apparentMagnitude = star.magnitude + extinction;
      const belongsToFigure = figureKeys.has(vectorKey(star.vector));

      if (apparentMagnitude > magnitudeLimit && !belongsToFigure) {
        continue;
      }

      visible.push({
        ...star,
        vector,
        altitude,
        extinction,
        apparentMagnitude,
        belongsToFigure,
      });
    }

    return visible;
  }

  circumpolarCircle(steps = 96) {
    const boundary = 90 - Math.abs(this.latitude);

    if (boundary <= 0.5 || boundary >= 89.5) {
      return [];
    }

    const declination = this.latitude >= 0 ? boundary : -boundary;
    const points = [];

    for (let step = 0; step <= steps; step += 1) {
      const rightAscension = (360 * step) / steps;
      points.push(this.horizonFromEquatorial(rightAscension, declination));
    }

    return points;
  }

  eclipticVectors(step = 3) {
    return eclipticPath(this.julianDay, step).map(
      ([rightAscension, declination]) =>
        this.toHorizon(sphericalToVector(rightAscension, declination)),
    );
  }
}

export default SkyModel;
