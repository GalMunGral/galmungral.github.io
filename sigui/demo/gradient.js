import { Edge, Polygon } from "../modules/polygon.js";
import { Color, Vec2, setup } from "../modules/utils.js";
import { linearGradient, radialGradient } from "../modules/gradient.js";

const canvas = document.querySelector("#gradient");
const colorInput1 = document.querySelector("#gradient-color-1");
const colorInput2 = document.querySelector("#gradient-color-2");

let color1 = [0.0, 0.0, 0.0, 1.0];
let color2 = [0.0, 0.0, 0.0, 1.0];

const S = 150;
const margin = 50;
const p1 = new Vec2(-S, -S);
const p2 = new Vec2(+S, -S);
const p3 = new Vec2(S, S);
const p4 = new Vec2(-S, S);

const square = new Polygon([
  new Edge(p1, p2),
  new Edge(p2, p3),
  new Edge(p3, p4),
  new Edge(p4, p1),
]);

setup(canvas, (buffer) => {
  color1 = Color.parse(colorInput1.value);
  color2 = Color.parse(colorInput2.value);

  const centerX = buffer.width / 2;
  const centerY = buffer.height / 2;

  buffer.clear();

  square
    .translate(centerX + S + margin, centerY)
    .fill(buffer, linearGradient(centerY - S, centerY + S, color1, color2));

  square
    .translate(centerX - S - margin, centerY)
    .fill(
      buffer,
      radialGradient(
        new Vec2(centerX - 2 * S - margin, centerY - S),
        Math.sqrt(8) * S,
        color1,
        color2
      )
    );
});
