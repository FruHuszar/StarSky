/**
 * A lap teljes görgetési viselkedése egy helyen.
 *
 * ScrollTarget: egy görgethető felület (az ablak vagy egy elem) példánya. A
 * pozíciót lebegőpontosan tartja számon, mert a böngésző scrollY és scrollTop
 * értéke egész számra kerekít, és a kerekítés a cél előtt megállítaná az
 * animációt.
 *
 * A saját animációt bármikor felülírja a felhasználó: ha az ablak pozíciója
 * eltér attól, amit utoljára beállítottunk, az animáció megáll.
 *
 * PageScroll: a szabályok. Az oldal két teljes képernyős szekcióból áll, a
 * második ráúszik az elsőre, és a kettő között nem állunk meg. Fekvő nézetben
 * a szekción belül mindig a bal oszlop görög, a kurzor helyétől függetlenül;
 * álló nézetben a szekció normál oldalgörgetést kap.
 */

const PAGE_DURATION = 950;
const COLUMN_DURATION = 460;
const COLUMN_FACTOR = 1.1;
const SETTLE_DELAY = 140;
const EDGE = 2;

const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

const easeInOutCubic = (progress) =>
  progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

class ScrollTarget {
  constructor(node) {
    this.node = node;
    this.value = 0;
    this.from = 0;
    this.to = 0;
    this.startedAt = 0;
    this.duration = 0;
    this.ease = easeOutCubic;
    this.frame = null;
    this.tick = this.tick.bind(this);
  }

  get isWindow() {
    return this.node === window;
  }

  get position() {
    return this.isWindow ? window.scrollY : this.node.scrollTop;
  }

  get limit() {
    const room = this.isWindow
      ? document.documentElement.scrollHeight - window.innerHeight
      : this.node.scrollHeight - this.node.clientHeight;

    return Math.max(0, room);
  }

  get isMoving() {
    return this.frame !== null;
  }

  get destination() {
    return this.isMoving ? this.to : this.position;
  }

  moveTo(value) {
    this.value = value;

    if (this.isWindow) {
      window.scrollTo(0, value);
      return;
    }

    this.node.scrollTop = value;
  }

  animateTo(value, duration, ease = easeOutCubic) {
    const to = Math.max(0, Math.min(this.limit, value));
    const from = this.isMoving ? this.value : this.position;

    if (Math.abs(to - from) < 0.5) {
      return;
    }

    this.from = from;
    this.to = to;
    this.ease = ease;
    this.duration = duration;
    this.startedAt = performance.now();

    if (this.frame === null) {
      this.frame = requestAnimationFrame(this.tick);
    }
  }

  glideBy(delta, duration) {
    this.animateTo(this.destination + delta, duration);
  }

  tick(now) {
    const progress = Math.min(1, (now - this.startedAt) / this.duration);

    this.moveTo(this.from + (this.to - this.from) * this.ease(progress));

    if (progress < 1) {
      this.frame = requestAnimationFrame(this.tick);
      return;
    }

    this.stop();
  }

  stop() {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
    }

    this.frame = null;
  }
}

class PageScroll {
  constructor(section, panel) {
    this.section = section;
    this.page = new ScrollTarget(window);
    this.column = new ScrollTarget(panel);
    this.settleTimer = null;
    this.isPointerDown = false;
    this.viewportHeight = window.innerHeight;
    this.handleWheel = this.handleWheel.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.settle = this.settle.bind(this);
  }

  get isStacked() {
    return window.matchMedia("(orientation: portrait)").matches;
  }

  get anchor() {
    return Math.min(this.section.offsetTop, this.page.limit);
  }

  start() {
    window.addEventListener("wheel", this.handleWheel, { passive: false });
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("pointerdown", this.handlePointerDown, true);
    window.addEventListener("pointerup", this.handlePointerUp, true);
    window.addEventListener("pointercancel", this.handlePointerUp, true);
  }

  stop() {
    window.removeEventListener("wheel", this.handleWheel);
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("pointerdown", this.handlePointerDown, true);
    window.removeEventListener("pointerup", this.handlePointerUp, true);
    window.removeEventListener("pointercancel", this.handlePointerUp, true);
    clearTimeout(this.settleTimer);
    this.page.stop();
    this.column.stop();
  }

  stepOf(event) {
    if (event.deltaMode === 1) {
      return event.deltaY * 18;
    }

    if (event.deltaMode === 2) {
      return event.deltaY * window.innerHeight;
    }

    return event.deltaY;
  }

  nestedScroller(target) {
    let node = target instanceof Element ? target : null;

    while (node && node !== document.body) {
      if (node !== this.column.node && node.scrollHeight > node.clientHeight) {
        const style = getComputedStyle(node);

        if (/(auto|scroll)/.test(style.overflowY)) {
          return node;
        }
      }

      node = node.parentElement;
    }

    return null;
  }

  handleWheel(event) {
    const step = this.stepOf(event);

    if (step === 0) {
      return;
    }

    const nested = this.nestedScroller(event.target);

    if (nested) {
      const room =
        step > 0
          ? nested.scrollTop < nested.scrollHeight - nested.clientHeight - 1
          : nested.scrollTop > 1;

      if (!room) {
        event.preventDefault();
      }

      return;
    }

    const top = this.anchor;
    const position = this.page.destination;

    if (position < top - EDGE) {
      event.preventDefault();

      if (step > 0) {
        this.page.animateTo(top, PAGE_DURATION, easeInOutCubic);
      }

      return;
    }

    if (step < 0 && position <= top + EDGE && this.column.destination <= EDGE) {
      event.preventDefault();
      this.page.animateTo(0, PAGE_DURATION, easeInOutCubic);
      return;
    }

    if (this.isStacked) {
      return;
    }

    event.preventDefault();
    this.column.glideBy(step * COLUMN_FACTOR, COLUMN_DURATION);
  }

  handlePointerDown() {
    this.isPointerDown = true;
  }

  handlePointerUp() {
    this.isPointerDown = false;
    this.handleScroll();
  }

  handleScroll() {
    clearTimeout(this.settleTimer);

    if (this.page.isMoving) {
      if (Math.abs(this.page.position - this.page.value) <= EDGE) {
        return;
      }

      this.page.stop();
    }

    if (this.isPointerDown) {
      return;
    }

    if (window.innerHeight !== this.viewportHeight) {
      this.viewportHeight = window.innerHeight;
      return;
    }

    this.settleTimer = setTimeout(this.settle, SETTLE_DELAY);
  }

  settle() {
    const active = document.activeElement;

    if (active && /^(input|textarea|select)$/i.test(active.tagName)) {
      return;
    }

    const top = this.anchor;
    const position = this.page.position;

    if (position <= EDGE || position >= top - EDGE) {
      return;
    }

    this.page.animateTo(
      position > top / 2 ? top : 0,
      PAGE_DURATION,
      easeInOutCubic,
    );
  }
}

export default PageScroll;
