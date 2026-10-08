/**
 * Sztereografikus vetítés a nadírból: a zenit a korong közepén,
 * a horizont a peremén. Minden égi kör körként jelenik meg.
 *
 * Felfelé nézünk az égre, ezért észak van fent és kelet balra.
 * A horizontális vektor komponensei: [észak, kelet, fel].
 */

const DEG = Math.PI / 180;

class HorizonProjection {
  constructor(size, referenceSize = 500) {
    this.size = size;
    this.scale = size / referenceSize;
    this.centreX = size / 2;
    this.centreY = size / 2;
    this.radius = size / 2 - 2 * this.scale;
  }

  project([north, east, up]) {
    const factor = this.radius / (1 + Math.max(up, -0.999));

    return [this.centreX - east * factor, this.centreY - north * factor];
  }

  projectClamped(vector, minimumUp = -0.04) {
    const [north, east, up] = vector;

    if (up >= minimumUp) {
      return this.project(vector);
    }

    const length = Math.hypot(north, east) || 1;
    const radius = this.radius * 1.04;

    return [
      this.centreX - (east / length) * radius,
      this.centreY - (north / length) * radius,
    ];
  }

  /** Egy adott magassághoz tartozó körsugár (rácskörökhöz). */
  radiusForAltitude(altitude) {
    return (
      (this.radius * Math.cos(altitude * DEG)) / (1 + Math.sin(altitude * DEG))
    );
  }

  /** Az azimut irányába mutató pont a korongon, adott sugárnál. */
  pointAtAzimuth(azimuth, radius) {
    const angle = azimuth * DEG;

    return [
      this.centreX - Math.sin(angle) * radius,
      this.centreY - Math.cos(angle) * radius,
    ];
  }

  contains(x, y, margin = 0) {
    return (
      Math.hypot(x - this.centreX, y - this.centreY) < this.radius - margin
    );
  }

  /** Vízszintes felirat csak akkor fér ki, ha mindkét vége a korongon belül van. */
  fitsHorizontally(left, right, y, margin = 4) {
    return (
      this.contains(left, y, margin * this.scale) &&
      this.contains(right, y, margin * this.scale)
    );
  }
}

export default HorizonProjection;
