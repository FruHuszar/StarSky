/**
 * Feliratok helyfoglalása egyetlen rajzoláson belül.
 * Ami ütközne egy korábbi felirattal, azt inkább elhagyjuk.
 */
class LabelSpace {
  constructor() {
    this.boxes = [];
  }

  static box(left, right, centreY, height, padding = 1) {
    return {
      left: left - padding,
      right: right + padding,
      top: centreY - height / 2 - padding,
      bottom: centreY + height / 2 + padding,
    };
  }

  collides(box) {
    return this.boxes.some(
      (other) =>
        box.left < other.right &&
        box.right > other.left &&
        box.top < other.bottom &&
        box.bottom > other.top,
    );
  }

  place(box) {
    if (this.collides(box)) {
      return false;
    }

    this.boxes.push(box);

    return true;
  }

  clear() {
    this.boxes = [];
  }
}

export default LabelSpace;
