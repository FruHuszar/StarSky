/**
 * A térkép színei a CSS változókból jönnek, így egy későbbi ékszer-
 * előnézet (arany, ezüst, rozéarany foglalat) pusztán más CSS
 * változókkal más hangulatú térképet kap, kódmódosítás nélkül.
 */

const TOKENS = {
  sky: ["--starmap-sky", "#0a0d1a"],
  skyEdge: ["--starmap-sky-edge", "#171d33"],
  daylight: ["--starmap-daylight", "#3f5f8f"],
  daylightEdge: ["--starmap-daylight-edge", "#6a89b8"],
  glow: ["--starmap-glow", "#f0c98a"],
  dome: ["--starmap-dome", "#3c6fb8"],
  star: ["--starmap-star", "#ffffff"],
  constellation: ["--starmap-constellation", "#93a8cc"],
  grid: ["--starmap-grid", "#ffffff"],
  ecliptic: ["--starmap-ecliptic", "#a8863f"],
  milkyWay: ["--starmap-milkyway", "#cfe0ff"],
  label: ["--starmap-label", "#c8a35a"],
  ring: ["--starmap-ring", "#a8863f"],
  moon: ["--starmap-moon", "#f6f1e4"],
  sun: ["--starmap-sun", "#ffd27a"],
  gem: ["--starmap-gem", "#e9c46a"],
  gemCore: ["--starmap-gem-core", "#fffaf0"],
  titleFont: ["--font-title", "Georgia, serif"],
  bodyFont: ["--font", "sans-serif"],
};

class ChartPalette {
  constructor(values) {
    Object.assign(this, values);
  }

  static fromElement(element) {
    const styles = getComputedStyle(element);
    const values = {};

    Object.entries(TOKENS).forEach(([name, [property, fallback]]) => {
      values[name] = styles.getPropertyValue(property).trim() || fallback;
    });

    return new ChartPalette(values);
  }

  /** Hex szín adott átlátszósággal, canvas-barát formában. */
  static alpha(color, alpha) {
    const clamped = Math.max(0, Math.min(1, alpha));
    const hex = Math.round(clamped * 255)
      .toString(16)
      .padStart(2, "0");

    return `${color}${hex}`;
  }
}

export default ChartPalette;
