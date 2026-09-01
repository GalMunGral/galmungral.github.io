import { Color, setup } from "../modules/utils.js";
import { simplePolygon } from "../modules/polygon.js";
import { bezier, sampleBezier } from "../modules/bezier.js";
import { sampleCircle } from "../modules/ellipse.js";
import { makeCurve } from "../modules/curve.js";

const canvas = document.querySelector("#animation");

const controlPoints = [];
const duration = 10;
let now = 0;

setup(
  canvas,
  (buffer) => {
    if (controlPoints.length == 0) return;
    const t = (now % duration) / duration;
    const { x, y } = bezier(controlPoints, t);
    const color1 = Color.RED;
    const color2 = Color.BLUE;
    const color = color1.interpolate(color2, t);

    buffer.clear();

    if (controlPoints.length > 1) {
      makeCurve(sampleBezier(controlPoints, 20 * controlPoints.length), 4).fill(
        buffer,
        () => Color.BLACK
      );
    }

    controlPoints.forEach(({ x, y }, i) => {
      const color = color1.interpolate(color2, i / (controlPoints.length - 1));
      simplePolygon(sampleCircle(10))
        .scale(10)
        .translate(x, y)
        .fill(buffer, () => color);
    });

    simplePolygon(sampleCircle(20))
      .scale(10)
      .translate(x, y)
      .fill(buffer, () => color);

    now += 0.1;
  },
  {
    onClick(p) {
      controlPoints.push(p);
      now = 0;
    },
  }
);
