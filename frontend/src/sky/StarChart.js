/**
 * A csillagtérkép rajzolása vászonra: égbolt, rétegek, égitestek, feliratok.
 */

import ChartPalette from "./ChartPalette.js";
import HorizonProjection from "./HorizonProjection.js";
import LabelSpace from "./LabelSpace.js";
import catalog from "./StarCatalog.js";

const DEG = Math.PI / 180;
const REFERENCE_SIZE = 500;

class StarChart {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.labels = new LabelSpace();
  }

  render({
    model,
    settings,
    size = REFERENCE_SIZE,
    pixelRatio = 1,
    zoom = 1,
    pan = { x: 0, y: 0 },
  }) {
    this.model = model;
    this.settings = settings;
    this.palette = ChartPalette.fromElement(this.canvas);
    this.projection = new HorizonProjection(size, REFERENCE_SIZE);
    this.labels.clear();

    const context = this.context;

    this.canvas.width = Math.round(size * pixelRatio);
    this.canvas.height = Math.round(size * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, size, size);

    this.zoom = zoom;
    this.pan = pan;

    this.drawSky();

    context.save();
    context.beginPath();
    context.arc(
      this.projection.centreX,
      this.projection.centreY,
      this.projection.radius,
      0,
      2 * Math.PI,
    );
    context.clip();

    context.save();

    if (zoom !== 1 || pan.x !== 0 || pan.y !== 0) {
      context.translate(
        this.projection.centreX + pan.x,
        this.projection.centreY + pan.y,
      );
      context.scale(zoom, zoom);
      context.translate(-this.projection.centreX, -this.projection.centreY);
    }

    if (settings.showMilkyWay) {
      this.drawMilkyWay();
    }

    if (settings.showGrid) {
      this.drawGrid();
    }

    if (settings.showCircumpolar) {
      this.drawCircumpolarCircle();
    }

    if (settings.showEcliptic) {
      this.drawEcliptic();
    }

    if (settings.showConstellations) {
      this.drawConstellations();
    }

    const stars = this.drawStars();
    const planets = settings.showPlanets ? this.drawPlanets() : [];
    const moon = settings.showMoon ? this.drawMoon() : null;
    const sun = settings.showSun ? this.drawSun() : null;
    const favourites = this.drawFavouriteGems(stars);

    context.restore();

    this.drawLightDome();

    context.restore();

    this.drawHorizon();

    return {
      stars: stars.concat(favourites.extra),
      planets,
      moon,
      sun,
      favourites: favourites.drawn,
      daylightFavourites: favourites.daylight,
      missingFavourites: favourites.missing,
      sunAltitude: model.sun.altitude,
      isDaylight: model.sun.altitude > -6,
      utcOffsetLabel: model.utcOffsetLabel,
    };
  }

  get scale() {
    return this.projection.scale;
  }

  fixed(value) {
    return (value * this.scale) / (this.zoom ?? 1);
  }

  get daylight() {
    return Math.max(0, Math.min(1, (this.model.sun.altitude + 12) / 18));
  }

  drawSky() {
    const context = this.context;
    const { centreX, centreY, radius } = this.projection;
    const palette = this.palette;
    const daylight = this.daylight;

    const gradient = context.createRadialGradient(
      centreX,
      centreY,
      0,
      centreX,
      centreY,
      radius,
    );
    gradient.addColorStop(0, palette.sky);
    gradient.addColorStop(1, palette.skyEdge);

    context.save();
    context.beginPath();
    context.arc(centreX, centreY, radius, 0, 2 * Math.PI);
    context.fillStyle = gradient;
    context.fill();

    if (daylight > 0) {
      const day = context.createRadialGradient(
        centreX,
        centreY,
        0,
        centreX,
        centreY,
        radius,
      );
      day.addColorStop(0, palette.daylight);
      day.addColorStop(1, palette.daylightEdge);
      context.globalAlpha = daylight * 0.85;
      context.fillStyle = day;
      context.fill();
    }

    context.restore();

    this.drawSunGlow();
  }

  drawSunGlow() {
    const sun = this.model.sun;

    if (sun.altitude < -14) {
      return;
    }

    const context = this.context;
    const { radius } = this.projection;
    const strength = Math.max(0, Math.min(1, (sun.altitude + 14) / 20));
    const [x, y] = this.projection.projectClamped(sun.vector);
    const spread = radius * 0.75;

    const glow = context.createRadialGradient(x, y, 0, x, y, spread);
    glow.addColorStop(
      0,
      ChartPalette.alpha(this.palette.glow, 0.55 * strength),
    );
    glow.addColorStop(1, ChartPalette.alpha(this.palette.glow, 0));

    context.save();
    context.beginPath();
    context.arc(
      this.projection.centreX,
      this.projection.centreY,
      radius,
      0,
      2 * Math.PI,
    );
    context.clip();
    context.fillStyle = glow;
    context.fillRect(x - spread, y - spread, spread * 2, spread * 2);
    context.restore();
  }

  drawLightDome() {
    const strength = Math.max(
      0,
      Math.min(1, (5.6 - this.settings.magnitudeLimit) / 2.4),
    );

    if (strength <= 0.01) {
      return;
    }

    const context = this.context;
    const { centreX, centreY, radius } = this.projection;
    const dome = context.createRadialGradient(
      centreX,
      centreY,
      radius * 0.55,
      centreX,
      centreY,
      radius,
    );

    dome.addColorStop(0, ChartPalette.alpha(this.palette.glow, 0));
    dome.addColorStop(
      1,
      ChartPalette.alpha(
        this.palette.glow,
        0.3 * strength * (1 - this.daylight),
      ),
    );

    context.save();
    context.beginPath();
    context.arc(centreX, centreY, radius, 0, 2 * Math.PI);
    context.fillStyle = dome;
    context.fill();
    context.restore();
  }

  drawMilkyWay() {
    const context = this.context;
    const alphas = [0.05, 0.05, 0.06, 0.07, 0.08];
    const fade = 1 - this.daylight;

    if (fade <= 0.05) {
      return;
    }

    context.save();

    if (typeof context.filter === "string") {
      context.filter = `blur(${Math.max(2, 5 * this.scale)}px)`;
    }

    catalog.milkyWay.forEach((level) => {
      context.fillStyle = this.palette.milkyWay;
      context.globalAlpha = (alphas[level.level - 1] ?? 0.05) * fade;
      context.beginPath();

      level.rings.forEach((ring) => {
        const vectors = ring.map((vector) => this.model.toHorizon(vector));

        if (vectors.every((vector) => vector[2] < -0.04)) {
          return;
        }

        vectors.forEach((vector, index) => {
          const [x, y] = this.projection.projectClamped(vector);

          if (index === 0) {
            context.moveTo(x, y);
            return;
          }

          context.lineTo(x, y);
        });

        context.closePath();
      });

      context.fill();
    });

    context.restore();
  }

  drawGrid() {
    const context = this.context;
    const { centreX, centreY, radius } = this.projection;

    context.save();
    context.strokeStyle = this.palette.grid;
    context.lineWidth = this.fixed(0.6);

    [15, 30, 45, 60, 75].forEach((altitude) => {
      context.globalAlpha = altitude % 30 === 0 ? 0.12 : 0.06;
      context.beginPath();
      context.arc(
        centreX,
        centreY,
        this.projection.radiusForAltitude(altitude),
        0,
        2 * Math.PI,
      );
      context.stroke();
    });

    context.globalAlpha = 0.08;

    for (let azimuth = 0; azimuth < 360; azimuth += 30) {
      const [x, y] = this.projection.pointAtAzimuth(azimuth, radius);
      context.beginPath();
      context.moveTo(centreX, centreY);
      context.lineTo(x, y);
      context.stroke();
    }

    context.restore();

    this.drawZenithMark();
  }

  drawZenithMark() {
    const context = this.context;
    const { centreX, centreY } = this.projection;
    const arm = 4 * this.scale;

    context.save();
    context.strokeStyle = this.palette.grid;
    context.globalAlpha = 0.3;
    context.lineWidth = this.fixed(0.7);
    context.beginPath();
    context.moveTo(centreX - arm, centreY);
    context.lineTo(centreX + arm, centreY);
    context.moveTo(centreX, centreY - arm);
    context.lineTo(centreX, centreY + arm);
    context.stroke();
    context.restore();
  }

  drawCircumpolarCircle() {
    const points = this.model.circumpolarCircle();

    if (points.length === 0) {
      return;
    }

    const context = this.context;

    context.save();
    context.strokeStyle = this.palette.label;
    context.globalAlpha = 0.35;
    context.lineWidth = this.fixed(0.8);
    context.setLineDash([this.fixed(2), this.fixed(4)]);
    this.strokeSegments(this.clipLine(points));
    context.restore();
  }

  drawEcliptic() {
    const context = this.context;

    context.save();
    context.strokeStyle = this.palette.ecliptic;
    context.globalAlpha = 0.4;
    context.lineWidth = this.fixed(0.9);
    context.setLineDash([this.fixed(4), this.fixed(5)]);
    this.strokeSegments(this.clipLine(this.model.eclipticVectors()));
    context.restore();
  }

  drawConstellations() {
    const context = this.context;
    const fade = 1 - this.daylight * 0.6;

    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";

    catalog.constellations.forEach((constellation) => {
      context.strokeStyle = this.palette.constellation;
      context.globalAlpha = 0.42 * fade;
      context.lineWidth = this.fixed(0.85);

      constellation.lines.forEach((line) => {
        const vectors = this.densify(
          line.map((vector) => this.model.toHorizon(vector)),
        );
        this.strokeSegments(this.clipLine(vectors));
      });

      if (!this.settings.showConstellationNames || constellation.rank > 2) {
        return;
      }

      this.drawConstellationName(constellation, fade);
    });

    context.restore();
  }

  drawConstellationName(constellation, fade) {
    const anchor = this.model.toHorizon(constellation.anchorVector);

    if (this.model.altitudeOf(anchor) < 6) {
      return;
    }

    const context = this.context;
    const [x, y] = this.projection.project(anchor);
    const label = constellation.hu.toUpperCase();
    const tracking = this.fixed(1.6);

    context.globalAlpha = 0.72 * fade;
    context.fillStyle = this.palette.label;
    context.font = `${this.fixed(9)}px ${this.palette.titleFont}`;
    context.textAlign = "left";
    context.textBaseline = "middle";

    const width = this.measureTracked(label, tracking);

    if (!this.projection.fitsHorizontally(x - width / 2, x + width / 2, y, 6)) {
      return;
    }

    if (
      !this.labels.place(
        LabelSpace.box(x - width / 2, x + width / 2, y, this.fixed(11)),
      )
    ) {
      return;
    }

    this.drawTrackedText(label, x, y, tracking);
  }

  drawStars() {
    const context = this.context;
    const settings = this.settings;
    const visible = this.model.visibleStars(settings.magnitudeLimit);
    const fade = 1 - this.daylight * 0.55;
    const named = [];

    context.save();
    context.textAlign = "left";
    context.textBaseline = "middle";

    visible.forEach((star) => {
      const [x, y] = this.projection.project(star.vector);
      const size =
        Math.max(0.42, (6.6 - star.apparentMagnitude) * 0.44) * this.scale;
      const alpha =
        Math.max(
          0.18,
          Math.min(
            1,
            (settings.magnitudeLimit - star.apparentMagnitude + 0.35) / 0.7,
          ),
        ) * fade;
      const color = this.starColor(star.colorIndex, star.extinction);

      context.globalAlpha = alpha;

      if (star.apparentMagnitude < 2.2) {
        this.drawGlow(x, y, size * 4.5, color, 0.5);
      }

      if (star.apparentMagnitude < 0.4) {
        this.drawSparkle(x, y, size * 3.4, this.rgba(color, 0.35));
      }

      context.fillStyle = this.rgba(color, 1);
      context.beginPath();
      context.arc(x, y, size, 0, 2 * Math.PI);
      context.fill();
      context.globalAlpha = 1;

      if (!star.name || !this.isOnScreen(x, y)) {
        return;
      }

      named.push({
        name: star.name,
        magnitude: Number(star.apparentMagnitude.toFixed(2)),
        altitude: Number(star.altitude.toFixed(1)),
        azimuth: Number(this.model.azimuthOf(star.vector).toFixed(1)),
        x,
        y,
        size,
      });

      const isFavourite = (settings.favouriteStars ?? []).includes(star.name);

      if (isFavourite || (settings.showStarNames && star.magnitude <= 1.8)) {
        context.font = `${this.fixed(8.5)}px ${this.palette.bodyFont}`;
        context.fillStyle = isFavourite ? this.palette.gem : this.palette.star;
        context.globalAlpha = isFavourite ? 0.95 : 0.7;
        this.drawPointLabel(star.name, x, y, isFavourite ? size * 2.4 : size);
        context.globalAlpha = 1;
      }
    });

    context.restore();

    return named;
  }

  drawPlanets() {
    const context = this.context;
    const settings = this.settings;
    const fade = 1 - this.daylight * 0.5;
    const drawn = [];

    context.save();
    context.textAlign = "left";
    context.textBaseline = "middle";

    this.model.planets.forEach((planet) => {
      if (
        !planet.isVisible ||
        planet.apparentMagnitude > settings.magnitudeLimit + 1
      ) {
        return;
      }

      const [x, y] = this.projection.project(planet.vector);
      const radius =
        Math.max(1.2, 2.5 - planet.apparentMagnitude * 0.3) * this.scale;

      context.globalAlpha = fade;
      this.drawGlow(x, y, radius * 3.6, planet.color, 0.44);
      context.fillStyle = planet.color;
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI);
      context.fill();
      context.globalAlpha = 1;

      drawn.push({
        id: planet.id,
        name: planet.hu,
        magnitude: Number(planet.apparentMagnitude.toFixed(2)),
        altitude: Number(planet.altitude.toFixed(1)),
      });

      if (settings.showStarNames) {
        context.font = `${this.fixed(8.5)}px ${this.palette.bodyFont}`;
        context.fillStyle = planet.color;
        context.globalAlpha = 0.85 * fade;
        this.drawPointLabel(planet.hu, x, y, radius);
        context.globalAlpha = 1;
      }
    });

    context.restore();

    return drawn;
  }

  drawMoon() {
    const moon = this.model.moon;

    if (!moon.isVisible) {
      return null;
    }

    const context = this.context;
    const [x, y] = this.projection.project(moon.vector);
    const radius = 6.5 * this.scale;
    const limbAngle = this.brightLimbScreenAngle(moon, x, y);
    const lit = moon.illumination;

    context.save();
    this.drawGlow(x, y, radius * 4, this.palette.moon, 0.34);

    context.globalAlpha = 0.22;
    context.fillStyle = this.palette.moon;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();

    context.globalAlpha = 1;
    context.beginPath();
    context.ellipse(x, y, radius, radius, limbAngle, -Math.PI / 2, Math.PI / 2);
    context.ellipse(
      x,
      y,
      Math.abs(2 * lit - 1) * radius,
      radius,
      limbAngle,
      Math.PI / 2,
      -Math.PI / 2,
      lit < 0.5,
    );
    context.closePath();
    context.fill();

    context.globalAlpha = 0.35;
    context.strokeStyle = this.palette.moon;
    context.lineWidth = this.fixed(0.5);
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.stroke();
    context.restore();

    return {
      illumination: Number((moon.illumination * 100).toFixed(0)),
      waxing: moon.waxing,
      altitude: Number(moon.altitude.toFixed(1)),
    };
  }

  drawSun() {
    const sun = this.model.sun;

    if (sun.altitude < -0.5) {
      return null;
    }

    const context = this.context;
    const [x, y] = this.projection.project(sun.vector);
    const radius = 7 * this.scale;

    context.save();
    this.drawGlow(x, y, radius * 5, this.palette.sun, 0.6);
    context.fillStyle = this.palette.sun;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
    context.restore();

    return { altitude: Number(sun.altitude.toFixed(1)) };
  }

  drawFavouriteGems(stars) {
    const chosen = this.settings.favouriteStars ?? [];
    const drawn = [];
    const daylight = [];
    const missing = [];
    const extra = [];

    chosen.forEach((name) => {
      const star = stars.find((item) => item.name === name);

      if (star && this.isOnScreen(star.x, star.y)) {
        this.drawGem(star.x, star.y);
        drawn.push(name);
        return;
      }

      const placement = star ? null : this.model.locateStar(name);

      if (placement) {
        const [x, y] = this.projection.project(placement.vector);

        if (this.isOnScreen(x, y)) {
          this.drawGem(x, y);
          drawn.push(name);
          extra.push({
            name,
            magnitude: placement.star.magnitude,
            altitude: Number(
              this.model.altitudeOf(placement.vector).toFixed(1),
            ),
            azimuth: Number(this.model.azimuthOf(placement.vector).toFixed(1)),
            x,
            y,
          });

          if (placement.isDaylight) {
            daylight.push(name);
          }

          return;
        }
      }

      missing.push(name);
    });

    return { drawn, daylight, missing, extra };
  }

  isOnScreen(x, y) {
    const { centreX, centreY, radius } = this.projection;
    const zoom = this.zoom ?? 1;
    const screenX = (x - centreX) * zoom + centreX + (this.pan?.x ?? 0);
    const screenY = (y - centreY) * zoom + centreY + (this.pan?.y ?? 0);

    return Math.hypot(screenX - centreX, screenY - centreY) <= radius;
  }

  drawGem(x, y) {
    const context = this.context;
    const radius = 8.5 * this.scale;
    const facets = 8;
    const corner = (index) => {
      const angle = (index / facets) * 2 * Math.PI - Math.PI / 2;

      return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius];
    };

    context.save();
    this.drawGlow(x, y, radius * 3.4, this.palette.gem, 0.55);

    context.beginPath();
    for (let index = 0; index < facets; index += 1) {
      const point = corner(index);

      if (index === 0) {
        context.moveTo(...point);
        continue;
      }

      context.lineTo(...point);
    }
    context.closePath();

    const shine = context.createLinearGradient(
      x - radius,
      y - radius,
      x + radius,
      y + radius,
    );
    shine.addColorStop(0, this.palette.gemCore);
    shine.addColorStop(0.5, this.palette.gem);
    shine.addColorStop(1, this.palette.gemCore);
    context.fillStyle = shine;
    context.fill();

    context.strokeStyle = this.palette.ring;
    context.lineWidth = this.fixed(0.9);
    context.stroke();

    context.globalAlpha = 0.55;
    context.lineWidth = this.fixed(0.5);
    context.beginPath();
    for (let index = 0; index < facets; index += 1) {
      context.moveTo(x, y);
      context.lineTo(...corner(index));
    }
    context.stroke();

    context.globalAlpha = 1;
    context.fillStyle = this.palette.gemCore;
    context.beginPath();
    context.arc(x, y, radius * 0.32, 0, 2 * Math.PI);
    context.fill();

    this.drawSparkle(
      x,
      y,
      radius * 2.2,
      ChartPalette.alpha(this.palette.gemCore, 0.75),
    );
    context.restore();
  }

  drawHorizon() {
    const context = this.context;
    const { centreX, centreY, radius } = this.projection;

    context.save();
    context.strokeStyle = this.palette.ring;
    context.globalAlpha = 0.55;
    context.lineWidth = 1 * this.scale;
    context.beginPath();
    context.arc(centreX, centreY, radius, 0, 2 * Math.PI);
    context.stroke();

    if (!this.settings.showCardinals) {
      context.restore();
      return;
    }

    context.globalAlpha = 0.85;
    context.fillStyle = this.palette.label;
    context.font = `${10 * this.scale}px ${this.palette.titleFont}`;
    context.textAlign = "left";
    context.textBaseline = "middle";

    [
      ["É", 0],
      ["K", 90],
      ["D", 180],
      ["Ny", 270],
    ].forEach(([label, azimuth]) => {
      const [x, y] = this.projection.pointAtAzimuth(
        azimuth,
        radius - 11 * this.scale,
      );
      this.drawTrackedText(label, x, y, 2 * this.scale);
    });

    context.restore();
  }

  drawGlow(x, y, radius, color, alpha) {
    const context = this.context;
    const glow = context.createRadialGradient(x, y, 0, x, y, radius);

    glow.addColorStop(0, this.withAlpha(color, alpha));
    glow.addColorStop(0.5, this.withAlpha(color, alpha * 0.28));
    glow.addColorStop(1, this.withAlpha(color, 0));

    context.fillStyle = glow;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
  }

  drawSparkle(x, y, reach, strokeStyle) {
    const context = this.context;

    context.save();
    context.strokeStyle = strokeStyle;
    context.lineWidth = this.fixed(0.6);
    context.beginPath();
    context.moveTo(x - reach, y);
    context.lineTo(x + reach, y);
    context.moveTo(x, y - reach);
    context.lineTo(x, y + reach);
    context.stroke();
    context.restore();
  }

  strokeSegments(segments) {
    if (segments.length === 0) {
      return;
    }

    const context = this.context;
    context.beginPath();

    segments.forEach((segment) => {
      segment.forEach((vector, index) => {
        const [x, y] = this.projection.project(vector);

        if (index === 0) {
          context.moveTo(x, y);
          return;
        }

        context.lineTo(x, y);
      });
    });

    context.stroke();
  }

  measureTracked(text, tracking) {
    const characters = [...text];

    return (
      characters.reduce(
        (sum, character) => sum + this.context.measureText(character).width,
        0,
      ) +
      tracking * (characters.length - 1)
    );
  }

  drawTrackedText(text, x, y, tracking) {
    const context = this.context;
    let cursor = x - this.measureTracked(text, tracking) / 2;

    [...text].forEach((character) => {
      context.fillText(character, cursor, y);
      cursor += context.measureText(character).width + tracking;
    });
  }

  drawPointLabel(text, x, y, radius) {
    const context = this.context;
    const width = context.measureText(text).width;
    const height = this.fixed(10);
    const gap = radius + this.fixed(4);

    const candidates = [
      { left: x + gap, top: y },
      { left: x - gap - width, top: y },
      { left: x - width / 2, top: y + gap + height * 0.6 },
      { left: x - width / 2, top: y - gap - height * 0.6 },
    ];

    return candidates.some((candidate) => {
      const right = candidate.left + width;

      if (
        !this.projection.fitsHorizontally(
          candidate.left,
          right,
          candidate.top,
          4,
        )
      ) {
        return false;
      }

      if (
        !this.labels.place(
          LabelSpace.box(candidate.left, right, candidate.top, height),
        )
      ) {
        return false;
      }

      context.fillText(text, candidate.left, candidate.top);

      return true;
    });
  }

  brightLimbScreenAngle(moon, x, y) {
    const north = this.projection.project(
      this.model.horizonFromEquatorial(
        moon.rightAscension,
        moon.declination + 0.5,
      ),
    );
    const east = this.projection.project(
      this.model.horizonFromEquatorial(
        moon.rightAscension + 0.5 / Math.cos(moon.declination * DEG),
        moon.declination,
      ),
    );

    const northUnit = this.unit(north[0] - x, north[1] - y);
    const eastUnit = this.unit(east[0] - x, east[1] - y);
    const limbCos = Math.cos(moon.brightLimbAngle * DEG);
    const limbSin = Math.sin(moon.brightLimbAngle * DEG);

    return Math.atan2(
      northUnit[1] * limbCos + eastUnit[1] * limbSin,
      northUnit[0] * limbCos + eastUnit[0] * limbSin,
    );
  }

  unit(x, y) {
    const length = Math.hypot(x, y) || 1;

    return [x / length, y / length];
  }

  starColor(colorIndex, extinction = 0) {
    const bv = Math.max(
      -0.4,
      Math.min(2, (colorIndex || 0) + extinction * 0.35),
    );

    if (bv < 0) {
      return [175 + bv * 40, 200 + bv * 30, 255];
    }

    if (bv < 0.6) {
      return [255 - bv * 10, 255 - bv * 25, 255 - bv * 105];
    }

    if (bv < 1.4) {
      return [255, 240 - (bv - 0.6) * 55, 195 - (bv - 0.6) * 90];
    }

    return [255, 190 - (bv - 1.4) * 30, 130 - (bv - 1.4) * 30];
  }

  withAlpha(color, alpha) {
    return Array.isArray(color)
      ? this.rgba(color, alpha)
      : ChartPalette.alpha(color, alpha);
  }

  rgba([red, green, blue], alpha) {
    return `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)}, ${alpha})`;
  }

  densify(points, maximumAngle = 4) {
    if (points.length < 2) {
      return points;
    }

    const limit = Math.cos(maximumAngle * DEG);
    const result = [points[0]];

    for (let index = 1; index < points.length; index += 1) {
      const from = points[index - 1];
      const to = points[index];
      const dot = Math.max(
        -1,
        Math.min(1, from[0] * to[0] + from[1] * to[1] + from[2] * to[2]),
      );

      if (dot < limit) {
        const angle = Math.acos(dot);
        const steps = Math.ceil(angle / (maximumAngle * DEG));

        for (let step = 1; step < steps; step += 1) {
          const t = step / steps;
          const first = Math.sin((1 - t) * angle) / Math.sin(angle);
          const second = Math.sin(t * angle) / Math.sin(angle);

          result.push([
            from[0] * first + to[0] * second,
            from[1] * first + to[1] * second,
            from[2] * first + to[2] * second,
          ]);
        }
      }

      result.push(to);
    }

    return result;
  }

  clipLine(points, limit = 0) {
    const segments = [];
    let current = [];

    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      const previous = points[index - 1];

      if (point[2] >= limit) {
        if (previous && previous[2] < limit) {
          current.push(this.crossing(point, previous, limit));
        }

        current.push(point);
        continue;
      }

      if (previous && previous[2] >= limit) {
        current.push(this.crossing(previous, point, limit));
      }

      if (current.length > 1) {
        segments.push(current);
      }

      current = [];
    }

    if (current.length > 1) {
      segments.push(current);
    }

    return segments;
  }

  crossing(inside, outside, limit) {
    const t = (limit - outside[2]) / (inside[2] - outside[2]);
    const point = [
      outside[0] + (inside[0] - outside[0]) * t,
      outside[1] + (inside[1] - outside[1]) * t,
      limit,
    ];
    const length = Math.hypot(...point) || 1;

    return [point[0] / length, point[1] / length, point[2] / length];
  }
}

export default StarChart;
