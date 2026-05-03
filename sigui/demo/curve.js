import { Color, Vec2, setup } from "../modules/utils.js";
import { simplePolygon } from "../modules/polygon.js";
import { makeCurve } from "../modules/curve.js";

const canvas = document.querySelector("#curve");
const lineWidthInput = document.querySelector("#line-width");

const curves = [];

let dirty = false;

lineWidthInput.oninput = () => {
  dirty = true;
};

let pointerDown = false;

setup(
  canvas,
  (buffer) => {
    if (dirty) {
      dirty = false;
      buffer.clear();
      curves.forEach((curve) => {
        makeCurve(curve, +lineWidthInput.value / 2).fill(
          buffer,
          () => Color.BLACK
        );
      });
    }
  },
  {
    onPointerDown(p) {
      pointerDown = true;
      curves.push([]);
    },
    onPointerUp() {
      pointerDown = false;
    },
    onPointerMove(p) {
      if (pointerDown) {
        curves[curves.length - 1].push(p);
        dirty = true;
      }
    },
  }
);
