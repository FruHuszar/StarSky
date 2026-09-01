/**
 * Csillagászati számítások a csillagtérképhez.
 *
 * Minden szög fokban értendő, a Julián-dátum TT/UT különbség nélkül,
 * ami ezen a méretarányon (1 képpont ~ 0.2°) nem látható eltérés.
 *
 * Források: Jean Meeus - Astronomical Algorithms (2. kiadás),
 * JPL "Approximate Positions of the Major Planets" (Standish).
 */

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const J2000 = 2451545.0;
const AU_PER_DAY_LIGHT = 173.1446;

export const normalizeDegrees = (value) => ((value % 360) + 360) % 360;

const sinDeg = (value) => Math.sin(value * DEG);
const cosDeg = (value) => Math.cos(value * DEG);

/** JavaScript Date (UTC alapon) -> Julián-dátum. */
export const toJulianDay = (date) => date.getTime() / 86400000 + 2440587.5;

export const centuriesSinceJ2000 = (julianDay) => (julianDay - J2000) / 36525;

/** Greenwichi csillagidő fokban (Meeus 12.4). */
export const greenwichSiderealTime = (julianDay) => {
  const days = julianDay - J2000;
  const centuries = days / 36525;

  return normalizeDegrees(
    280.46061837 +
      360.98564736629 * days +
      0.000387933 * centuries * centuries -
      (centuries * centuries * centuries) / 38710000,
  );
};

/** Helyi csillagidő fokban, keleti hosszúság pozitív. */
export const localSiderealTime = (julianDay, longitude) =>
  normalizeDegrees(greenwichSiderealTime(julianDay) + longitude);

export const sphericalToVector = (longitude, latitude) => {
  const cosLat = cosDeg(latitude);

  return [
    cosLat * cosDeg(longitude),
    cosLat * sinDeg(longitude),
    sinDeg(latitude),
  ];
};

export const vectorToSpherical = ([x, y, z]) => ({
  longitude: normalizeDegrees(Math.atan2(y, x) * RAD),
  latitude: Math.atan2(z, Math.hypot(x, y)) * RAD,
});

export const precessionMatrix = (julianDay) => {
  const t = centuriesSinceJ2000(julianDay);
  const arcsec = 1 / 3600;
  const zeta =
    (2306.2181 * t + 0.30188 * t * t + 0.017998 * t * t * t) * arcsec;
  const z = (2306.2181 * t + 1.09468 * t * t + 0.018203 * t * t * t) * arcsec;
  const theta =
    (2004.3109 * t - 0.42665 * t * t - 0.041833 * t * t * t) * arcsec;

  const cosZeta = cosDeg(zeta);
  const sinZeta = sinDeg(zeta);
  const cosZ = cosDeg(z);
  const sinZ = sinDeg(z);
  const cosTheta = cosDeg(theta);
  const sinTheta = sinDeg(theta);

  return [
    [
      cosZeta * cosTheta * cosZ - sinZeta * sinZ,
      -sinZeta * cosTheta * cosZ - cosZeta * sinZ,
      -sinTheta * cosZ,
    ],
    [
      cosZeta * cosTheta * sinZ + sinZeta * cosZ,
      -sinZeta * cosTheta * sinZ + cosZeta * cosZ,
      -sinTheta * sinZ,
    ],
    [cosZeta * sinTheta, -sinZeta * sinTheta, cosTheta],
  ];
};

export const applyMatrix = (matrix, [x, y, z]) => [
  matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z,
  matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z,
  matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z,
];

/** Az ekliptika ferdesége az adott dátumon, fokban (Meeus 22.2). */
export const obliquity = (julianDay) => {
  const t = centuriesSinceJ2000(julianDay);

  return (
    23.4392911 - (46.815 * t + 0.00059 * t * t - 0.001813 * t * t * t) / 3600
  );
};

/** Ekliptikai (hosszúság, szélesség) -> egyenlítői (rektaszcenzió, deklináció). */
export const eclipticToEquatorial = (longitude, latitude, julianDay) => {
  const eps = obliquity(julianDay);
  const [x, y, z] = sphericalToVector(longitude, latitude);
  const rotated = [
    x,
    y * cosDeg(eps) - z * sinDeg(eps),
    y * sinDeg(eps) + z * cosDeg(eps),
  ];
  const { longitude: ra, latitude: dec } = vectorToSpherical(rotated);

  return { rightAscension: ra, declination: dec };
};

export const equatorialToHorizontal = (
  rightAscension,
  declination,
  siderealTime,
  latitude,
) => {
  const hourAngle = normalizeDegrees(siderealTime - rightAscension);
  const sinDec = sinDeg(declination);
  const cosDec = cosDeg(declination);
  const sinLat = sinDeg(latitude);
  const cosLat = cosDeg(latitude);
  const cosHour = cosDeg(hourAngle);

  const altitude = Math.asin(sinDec * sinLat + cosDec * cosLat * cosHour) * RAD;
  const azimuth =
    Math.atan2(
      sinDeg(hourAngle),
      cosHour * sinLat - (sinDec / cosDec) * cosLat,
    ) *
      RAD +
    180;

  return { altitude, azimuth: normalizeDegrees(azimuth) };
};

/** Légköri refrakció (Bennett), a látszó magasságot adja vissza. */
export const refractedAltitude = (altitude) => {
  if (altitude < -1.5) {
    return altitude;
  }

  const correction =
    1.02 / Math.tan((altitude + 10.3 / (altitude + 5.11)) * DEG) / 60;

  return altitude + correction;
};

export const topocentricAltitude = (altitude, distanceKilometres) => {
  const parallax = Math.asin(6378.14 / distanceKilometres) * RAD;

  return altitude - parallax * cosDeg(altitude);
};

/** A Nap látszó egyenlítői koordinátái (Meeus 25, ~0.01° pontosság). */
export const sunPosition = (julianDay) => {
  const t = centuriesSinceJ2000(julianDay);
  const meanLongitude = normalizeDegrees(
    280.46646 + 36000.76983 * t + 0.0003032 * t * t,
  );
  const meanAnomaly = normalizeDegrees(
    357.52911 + 35999.05029 * t - 0.0001537 * t * t,
  );
  const center =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * sinDeg(meanAnomaly) +
    (0.019993 - 0.000101 * t) * sinDeg(2 * meanAnomaly) +
    0.000289 * sinDeg(3 * meanAnomaly);
  const trueLongitude = meanLongitude + center;
  const omega = 125.04 - 1934.136 * t;
  const apparentLongitude = trueLongitude - 0.00569 - 0.00478 * sinDeg(omega);
  const eccentricity = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;
  const trueAnomaly = meanAnomaly + center;
  const distance =
    (1.000001018 * (1 - eccentricity * eccentricity)) /
    (1 + eccentricity * cosDeg(trueAnomaly));

  const { rightAscension, declination } = eclipticToEquatorial(
    apparentLongitude,
    0,
    julianDay,
  );

  return {
    rightAscension,
    declination,
    longitude: normalizeDegrees(apparentLongitude),
    distance,
  };
};

export const moonPosition = (julianDay) => {
  const t = centuriesSinceJ2000(julianDay);
  const meanLongitude = normalizeDegrees(
    218.3164477 + 481267.88123421 * t - 0.0015786 * t * t,
  );
  const meanElongation = normalizeDegrees(
    297.8501921 + 445267.1114034 * t - 0.0018819 * t * t,
  );
  const sunAnomaly = normalizeDegrees(
    357.5291092 + 35999.0502909 * t - 0.0001536 * t * t,
  );
  const moonAnomaly = normalizeDegrees(
    134.9633964 + 477198.8675055 * t + 0.0087414 * t * t,
  );
  const argumentOfLatitude = normalizeDegrees(
    93.272095 + 483202.0175233 * t - 0.0036539 * t * t,
  );

  const d = meanElongation;
  const m = sunAnomaly;
  const mp = moonAnomaly;
  const f = argumentOfLatitude;

  const longitude =
    meanLongitude +
    6.288774 * sinDeg(mp) +
    1.274027 * sinDeg(2 * d - mp) +
    0.658314 * sinDeg(2 * d) +
    0.213618 * sinDeg(2 * mp) -
    0.185116 * sinDeg(m) -
    0.114332 * sinDeg(2 * f) +
    0.058793 * sinDeg(2 * d - 2 * mp) +
    0.057066 * sinDeg(2 * d - m - mp) +
    0.05332 * sinDeg(2 * d + mp) +
    0.045758 * sinDeg(2 * d - m) -
    0.040923 * sinDeg(m - mp) -
    0.03472 * sinDeg(d) -
    0.030383 * sinDeg(m + mp) +
    0.015327 * sinDeg(2 * d - 2 * f) -
    0.012528 * sinDeg(mp + 2 * f) +
    0.01098 * sinDeg(mp - 2 * f) +
    0.010675 * sinDeg(4 * d - mp) +
    0.010034 * sinDeg(3 * mp) +
    0.008548 * sinDeg(4 * d - 2 * mp) -
    0.007888 * sinDeg(2 * d + m - mp) -
    0.006766 * sinDeg(2 * d + m) -
    0.005163 * sinDeg(d - mp) +
    0.004987 * sinDeg(d + m) +
    0.004036 * sinDeg(2 * d - m + mp) +
    0.003994 * sinDeg(2 * d + 2 * mp) +
    0.003861 * sinDeg(4 * d) +
    0.003665 * sinDeg(2 * d - 3 * mp);

  const latitude =
    5.128122 * sinDeg(f) +
    0.280602 * sinDeg(mp + f) +
    0.277693 * sinDeg(mp - f) +
    0.173237 * sinDeg(2 * d - f) +
    0.055413 * sinDeg(2 * d - mp + f) +
    0.046271 * sinDeg(2 * d - mp - f) +
    0.032573 * sinDeg(2 * d + f) +
    0.017198 * sinDeg(2 * mp + f) +
    0.009266 * sinDeg(2 * d + mp - f) +
    0.008822 * sinDeg(2 * mp - f) +
    0.008216 * sinDeg(2 * d - m - f) +
    0.004324 * sinDeg(2 * d - 2 * mp - f) +
    0.0042 * sinDeg(2 * d + mp + f) -
    0.003359 * sinDeg(2 * d + m - f);

  const distance =
    385000.56 -
    20905.355 * cosDeg(mp) -
    3699.111 * cosDeg(2 * d - mp) -
    2955.968 * cosDeg(2 * d) -
    569.925 * cosDeg(2 * mp) +
    246.158 * cosDeg(2 * d - 2 * mp) -
    204.586 * cosDeg(2 * d - m) -
    170.733 * cosDeg(2 * d + mp) -
    152.138 * cosDeg(2 * d - m - mp) -
    129.62 * cosDeg(d) +
    108.743 * cosDeg(d + mp) +
    104.755 * cosDeg(2 * d - 2 * f) +
    79.661 * cosDeg(mp - 2 * f);

  const { rightAscension, declination } = eclipticToEquatorial(
    normalizeDegrees(longitude),
    latitude,
    julianDay,
  );

  const sun = sunPosition(julianDay);
  const sunDistance = sun.distance * 149597870.7;
  const elongation =
    Math.acos(
      cosDeg(latitude) * cosDeg(normalizeDegrees(longitude) - sun.longitude),
    ) * RAD;
  const phaseAngle =
    Math.atan2(
      sunDistance * sinDeg(elongation),
      distance - sunDistance * cosDeg(elongation),
    ) * RAD;
  const illumination = (1 + cosDeg(phaseAngle)) / 2;

  const brightLimbAngle =
    Math.atan2(
      cosDeg(sun.declination) * sinDeg(sun.rightAscension - rightAscension),
      sinDeg(sun.declination) * cosDeg(declination) -
        cosDeg(sun.declination) *
          sinDeg(declination) *
          cosDeg(sun.rightAscension - rightAscension),
    ) * RAD;

  const waxing =
    normalizeDegrees(normalizeDegrees(longitude) - sun.longitude) < 180;

  return {
    rightAscension,
    declination,
    distance,
    illumination,
    phaseAngle,
    brightLimbAngle,
    waxing,
    angularRadius: (RAD * 1737.4) / distance,
  };
};

const PLANETS = [
  {
    id: "mercury",
    la: "Mercurius",
    hu: "Merkúr",
    color: "#c9c3ba",
    brightness: -0.42,
    elements: [
      0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593,
    ],
    rates: [
      0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689,
      -0.12534081,
    ],
  },
  {
    id: "venus",
    la: "Venus",
    hu: "Vénusz",
    color: "#f2e2c0",
    brightness: -4.4,
    elements: [
      0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718,
      76.67984255,
    ],
    rates: [
      0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329,
      -0.27769418,
    ],
  },
  {
    id: "earth",
    la: "Terra",
    hu: "Föld",
    color: "#8bb7d9",
    brightness: 0,
    elements: [
      1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0,
    ],
    rates: [
      0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0,
    ],
  },
  {
    id: "mars",
    la: "Mars",
    hu: "Mars",
    color: "#e07b53",
    brightness: -1.52,
    elements: [
      1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891,
    ],
    rates: [
      0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088,
      -0.29257343,
    ],
  },
  {
    id: "jupiter",
    la: "Iuppiter",
    hu: "Jupiter",
    color: "#e8d0a9",
    brightness: -9.4,
    elements: [
      5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909,
    ],
    rates: [
      -0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668,
      0.20469106,
    ],
  },
  {
    id: "saturn",
    la: "Saturnus",
    hu: "Szaturnusz",
    color: "#e3d6a8",
    brightness: -8.88,
    elements: [
      9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831,
      113.66242448,
    ],
    rates: [
      -0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216,
      -0.28867794,
    ],
  },
  {
    id: "uranus",
    la: "Uranus",
    hu: "Uránusz",
    color: "#b6dfe6",
    brightness: -7.19,
    elements: [
      19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.9542763,
      74.01692503,
    ],
    rates: [
      -0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281,
      0.04240589,
    ],
  },
  {
    id: "neptune",
    la: "Neptunus",
    hu: "Neptunusz",
    color: "#7fa8e8",
    brightness: -6.87,
    elements: [
      30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227,
      131.78422574,
    ],
    rates: [
      0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464,
      -0.00508664,
    ],
  },
];

const solveKepler = (meanAnomaly, eccentricity) => {
  const m = meanAnomaly * DEG;
  let eccentric = m + eccentricity * Math.sin(m);

  for (let i = 0; i < 8; i += 1) {
    const delta =
      (eccentric - eccentricity * Math.sin(eccentric) - m) /
      (1 - eccentricity * Math.cos(eccentric));
    eccentric -= delta;

    if (Math.abs(delta) < 1e-10) {
      break;
    }
  }

  return eccentric;
};

/** Heliocentrikus, J2000 ekliptikai koordináták (AU). */
const heliocentricVector = (planet, julianDay) => {
  const t = centuriesSinceJ2000(julianDay);
  const [a0, e0, i0, l0, peri0, node0] = planet.elements;
  const [da, de, di, dl, dperi, dnode] = planet.rates;

  const a = a0 + da * t;
  const e = e0 + de * t;
  const inclination = i0 + di * t;
  const perihelion = peri0 + dperi * t;
  const node = node0 + dnode * t;
  const meanLongitude = l0 + dl * t;
  const meanAnomaly = normalizeDegrees(meanLongitude - perihelion + 180) - 180;

  const eccentric = solveKepler(meanAnomaly, e);
  const xOrbit = a * (Math.cos(eccentric) - e);
  const yOrbit = a * Math.sqrt(1 - e * e) * Math.sin(eccentric);

  const argument = perihelion - node;
  const cosArg = cosDeg(argument);
  const sinArg = sinDeg(argument);
  const cosNode = cosDeg(node);
  const sinNode = sinDeg(node);
  const cosInc = cosDeg(inclination);
  const sinInc = sinDeg(inclination);

  return [
    (cosArg * cosNode - sinArg * sinNode * cosInc) * xOrbit +
      (-sinArg * cosNode - cosArg * sinNode * cosInc) * yOrbit,
    (cosArg * sinNode + sinArg * cosNode * cosInc) * xOrbit +
      (-sinArg * sinNode + cosArg * cosNode * cosInc) * yOrbit,
    sinArg * sinInc * xOrbit + cosArg * sinInc * yOrbit,
  ];
};

const magnitudeOf = (planet, sunDistance, earthDistance, phaseAngle) => {
  const base = planet.brightness + 5 * Math.log10(sunDistance * earthDistance);
  const i = phaseAngle;

  switch (planet.id) {
    case "mercury":
      return base + 0.038 * i - 0.000273 * i * i + 0.000002 * i * i * i;
    case "venus":
      return base + 0.0009 * i + 0.000239 * i * i - 0.00000065 * i * i * i;
    case "mars":
      return base + 0.016 * i;
    case "jupiter":
      return base + 0.005 * i;
    default:
      return base;
  }
};

export const planetPositions = (julianDay) => {
  const earth = PLANETS.find((planet) => planet.id === "earth");
  const earthVector = heliocentricVector(earth, julianDay);
  const matrix = precessionMatrix(julianDay);
  const eps = obliquity(J2000);

  return PLANETS.filter((planet) => planet.id !== "earth").map((planet) => {
    let vector = heliocentricVector(planet, julianDay);
    let geocentric = vector.map((value, index) => value - earthVector[index]);
    let distance = Math.hypot(...geocentric);

    for (let i = 0; i < 2; i += 1) {
      vector = heliocentricVector(
        planet,
        julianDay - distance / AU_PER_DAY_LIGHT,
      );
      geocentric = vector.map((value, index) => value - earthVector[index]);
      distance = Math.hypot(...geocentric);
    }

    const sunDistance = Math.hypot(...vector);
    const earthSunDistance = Math.hypot(...earthVector);
    const cosPhase =
      (sunDistance * sunDistance +
        distance * distance -
        earthSunDistance * earthSunDistance) /
      (2 * sunDistance * distance);
    const phaseAngle = Math.acos(Math.min(1, Math.max(-1, cosPhase))) * RAD;

    const [x, y, z] = geocentric;
    const equatorial = [
      x,
      y * cosDeg(eps) - z * sinDeg(eps),
      y * sinDeg(eps) + z * cosDeg(eps),
    ];
    const ofDate = applyMatrix(matrix, equatorial);
    const { longitude: ra, latitude: dec } = vectorToSpherical(ofDate);

    return {
      id: planet.id,
      la: planet.la,
      hu: planet.hu,
      color: planet.color,
      rightAscension: ra,
      declination: dec,
      distance,
      magnitude: magnitudeOf(planet, sunDistance, distance, phaseAngle),
    };
  });
};

/** Az ekliptika vonala az adott dátum egyenlítői rendszerében. */
export const eclipticPath = (julianDay, step = 3) => {
  const points = [];

  for (let longitude = 0; longitude <= 360; longitude += step) {
    const { rightAscension, declination } = eclipticToEquatorial(
      longitude,
      0,
      julianDay,
    );
    points.push([rightAscension, declination]);
  }

  return points;
};

export const airmass = (altitude) => {
  const apparent = Math.max(altitude, -0.5);

  return 1 / (sinDeg(apparent) + 0.50572 * (apparent + 6.07995) ** -1.6364);
};

export const extinctionMagnitudes = (altitude, coefficient = 0.25) =>
  coefficient * (airmass(altitude) - 1);

export const PLANET_LIST = PLANETS.filter((planet) => planet.id !== "earth");
