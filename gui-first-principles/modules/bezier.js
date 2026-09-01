import { Vec2 } from "./utils.js";

function boundingBox(points) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let { x, y } of points) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxY, maxX };
}

export function bezier(controlPoints, t) {
  const points = [...controlPoints];
  while (points.length > 1) {
    for (let i = 0; i < points.length - 1; ++i) {
      const { x: x1, y: y1 } = points[i];
      const { x: x2, y: y2 } = points[i + 1];
      points[i] = new Vec2((1 - t) * x1 + t * x2, (1 - t) * y1 + t * y2);
    }
    points.length--;
  }
  return points[0];
}

// TODO: fix oversampling
export function sampleBezier(controlPoints, n = 5) {
  const res = [];
  for (let t = 0; t < 1; t += 1 / n) {
    res.push(bezier([...controlPoints], t));
  }
  // TODO
  res.push(bezier([...controlPoints], 1));
  return res;
}
