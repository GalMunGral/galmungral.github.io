import { Color, setup } from "../modules/utils.js";
import { simplePolygon } from "../modules/polygon.js";
import { sampleCircle } from "../modules/ellipse.js";

const canvas = document.querySelector("#alpha-compositing");
const alphaInput = document.querySelector("#alpha");

let alpha = +alphaInput.value;

const S = 40;
const circle = simplePolygon(sampleCircle(30)).scale(2 * S);

let dirty = true;

alphaInput.oninput = () => {
  console.log("yo");
  alpha = +alphaInput.value;
  dirty = true;
};

setup(canvas, (buffer) => {
  if (dirty) {
    dirty = false;

    const red = new Color(1, 0, 0, alpha);
    const green = new Color(0, 1, 0, alpha);
    const blue = new Color(0, 0, 1, alpha);

    buffer.clear();

    circle
      .translate(
        buffer.width / 2 + S,
        buffer.height / 2 + S * (Math.sqrt(3) / 3)
      )
      .fill(buffer, () => blue);

    circle
      .translate(
        buffer.width / 2 - S,
        buffer.height / 2 + S * (Math.sqrt(3) / 3)
      )
      .fill(buffer, () => green);

    circle
      .translate(
        buffer.width / 2,
        buffer.height / 2 - S * ((Math.sqrt(3) * 2) / 3)
      )
      .fill(buffer, () => red);
  }
});
