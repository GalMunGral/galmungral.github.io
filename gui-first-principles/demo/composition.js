import { simplePolygon } from "../modules/polygon.js";
import { UIRenderer } from "../modules/ui.js";
import { Color, Vec2 } from "../modules/utils.js";
import { sampleBezier } from "../modules/bezier.js";
import { FontBook, makeText } from "../modules/font.js";

const canvas = document.querySelector("#recursion");
const buttonHeightInput = document.querySelector("#button-height");
const buttonWidthInput = document.querySelector("#button-width");
const buttonRadiusInput = document.querySelector("#button-radius");

class Box {
  static width = 300;
  static height = 200;

  active = false;
  hover = false;

  constructor(buttons) {
    this.buttons = buttons;
  }

  handlePointerOver() {
    console.log("yo");
    this.hover = true;
    return true;
  }

  handlePointerOut() {
    this.hover = false;
    this.active = false;
    return true;
  }

  handlePointerDown() {
    this.active = true;
    return true;
  }

  handlePointerUp() {
    this.active = false;
    return true;
  }

  layout(centerX, centerY) {
    const n = this.buttons.length;
    const spacing = (Box.height - n * Button.height) / (n + 1);
    if (spacing < 0) throw new Error("not enough space");

    const left = centerX - Box.width / 2;
    const right = centerX + Box.width / 2;
    const top = centerY - Box.height / 2;
    const bottom = centerY + Box.height / 2;

    const p1 = new Vec2(left, top);
    const p2 = new Vec2(right, top);
    const p3 = new Vec2(right, bottom);
    const p4 = new Vec2(left, bottom);

    this.geometry = simplePolygon([p1, p2, p3, p4]);

    let y = top + spacing + Button.height / 2;
    for (const child of this.buttons) {
      child.layout(centerX, y);
      y += spacing + Button.height;
    }
  }

  render(renderer) {
    const color = this.active
      ? new Color(0.9, 0.9, 0.9)
      : this.hover
      ? new Color(0.95, 0.95, 0.95)
      : new Color(0.95, 0.95, 0.95);
    renderer.render(this, this.geometry, () => color);

    for (const child of this.buttons) {
      child.render(renderer);
    }
  }
}

class Button {
  static width = 180;
  static height = 60;
  static radius = 30;

  active = false;
  hover = false;

  constructor(label) {
    this.text = new Text(label);
  }

  handlePointerOver() {
    this.hover = true;
    return true;
  }

  handlePointerOut() {
    this.hover = false;
    this.active = false;
    return true;
  }

  handlePointerDown() {
    this.active = true;
    return true;
  }

  handlePointerUp() {
    this.active = false;
    return true;
  }

  layout(centerX, centerY) {
    const left = centerX - Button.width / 2;
    const right = centerX + Button.width / 2;
    const top = centerY - Button.height / 2;
    const bottom = centerY + Button.height / 2;

    const radius = Math.min(Button.radius, Button.height / 2, Button.width / 2);

    this.geometry = simplePolygon([
      ...sampleBezier([
        new Vec2(left, top + radius),
        new Vec2(left, top),
        new Vec2(left + radius, top),
      ]),
      ...sampleBezier([
        new Vec2(right - radius, top),
        new Vec2(right, top),
        new Vec2(right, top + radius),
      ]),
      ...sampleBezier([
        new Vec2(right, bottom - radius),
        new Vec2(right, bottom),
        new Vec2(right - radius, bottom),
      ]),
      ...sampleBezier([
        new Vec2(left + radius, bottom),
        new Vec2(left, bottom),
        new Vec2(left, bottom - radius),
      ]),
    ]);

    const offsetX = 2;
    const offsetY = 2;

    this.shadowGeometry = this.geometry
      .translate(-centerX, -centerY)
      .translate(centerX + offsetX, centerY + offsetY);

    const paddingX = 20;
    const paddingY = 20;

    this.text.layout(
      centerX,
      centerY,
      right - left - 2 * paddingX,
      bottom - top - 2 * paddingY
    );
  }

  render(renderer) {
    const shadowColor = new Color(0.3, 0.3, 0.3, 0.5);
    const backgroundColor = this.active
      ? new Color(0, 0.34, 0.6)
      : this.hover
      ? new Color(0, 0.53, 0.82)
      : new Color(0, 0.47, 0.74);

    renderer.render(null, this.shadowGeometry, () => shadowColor);
    renderer.render(this, this.geometry, () => backgroundColor);

    this.text.render(renderer);
  }
}

class Text {
  constructor(text) {
    this.text = text;
  }

  layout(centerX, centerY, width, height) {
    let fontSize = height;
    let textWidth;

    while (fontSize > 0) {
      const path = FontBook.NotoSans.getPath(this.text, 0, 0, fontSize);
      const rect = path.getBoundingBox();
      textWidth = rect.x2 - rect.x1;
      if (textWidth < width) break;
      --fontSize;
    }

    this.geometry = makeText(
      this.text,
      centerX - textWidth / 2,
      centerY + fontSize / 4,
      fontSize,
      FontBook.NotoSans
    );
  }

  render(renderer) {
    // don't fire events on text
    renderer.render(null, this.geometry, () => Color.WHITE);
  }
}

const UI = new UIRenderer(
  canvas,
  new Box([new Button("HOVER"), new Button("CLICK")])
);

buttonRadiusInput.value = Button.radius;
buttonRadiusInput.oninput = () => {
  Button.radius = +buttonRadiusInput.value;
  UI.update();
};
