import { Color, Vec2, setup } from "../modules/utils.js";
import { Edge, Polygon } from "../modules/polygon.js";

const canvas = document.querySelector("#transform");

const S = 40;
const p1 = new Vec2(-S, -S);
const p2 = new Vec2(S, -S);
const p3 = new Vec2(S, S);
const p4 = new Vec2(-S, S);
const square = new Polygon([
  new Edge(p1, p2),
  new Edge(p2, p3),
  new Edge(p3, p4),
  new Edge(p4, p1),
]);

let dx = 100;
let dy = 100;
let t = 0;

let initial = true;
let dragging = false;
let prevPoint;

setup(
  canvas,
  (buffer) => {
    const transformed = square
      .rotate(t)
      .scale(1 + dx / 500)
      .translate(dx, dy);
    if (initial) {
      initial = false;
      transformed.fill(buffer, () => Color.BLACK);
    }
    if (dragging) {
      t += 0.1;
      buffer.clear();
      transformed.fill(buffer, () => Color.BLACK);
    }
  },
  {
    onPointerMove(p) {
      if (dragging) {
        dx += p.x - prevPoint.x;
        dy += p.y - prevPoint.y;
        prevPoint = p;
      }
    },
    onPointerDown(p) {
      const boundary = square
        .rotate(t)
        .scale(1 + dx / 500)
        .translate(dx, dy);
      if (boundary.contains(p)) {
        dragging = true;
        prevPoint = p;
      }
    },
    onPointerUp() {
      dragging = false;
    },
  }
);
