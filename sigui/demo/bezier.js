import { Color, setup } from "../modules/utils.js";
import { Edge, Polygon } from "../modules/polygon.js";
import { sampleBezier } from "../modules/bezier.js";

const canvas1 = document.querySelector("#quadratic-bezier");
const canvas2 = document.querySelector("#cubic-bezier");

let dirty1 = false;
let dirty2 = false;
const controlPoints1 = [];
const controlPoints2 = [];

function fillBezier(buffer, controlPoints, order, color) {
  const vertices = [];
  for (let i = 0; i < controlPoints.length; i += order) {
    if (controlPoints.length - i > order) {
      vertices.push(...sampleBezier(controlPoints.slice(i, i + order + 1), 64));
    }
  }
  const edges = [];
  for (let i = 0; i < vertices.length; ++i) {
    edges.push(new Edge(vertices[i], vertices[(i + 1) % vertices.length]));
  }
  new Polygon(edges).fill(buffer, color);
}

setup(
  canvas1,
  (buffer) => {
    if (dirty1) {
      dirty1 = false;
      buffer.clear();
      fillBezier(buffer, controlPoints1, 2, () => Color.BLACK);
    }
  },
  {
    onClick(p) {
      controlPoints1.push(p);
      dirty1 = true;
    },
  }
);

setup(
  canvas2,
  (buffer) => {
    if (dirty2) {
      dirty2 = false;
      buffer.clear();
      fillBezier(buffer, controlPoints2, 3, () => Color.BLACK);
    }
  },
  {
    onClick(p) {
      controlPoints2.push(p);
      dirty2 = true;
    },
  }
);
