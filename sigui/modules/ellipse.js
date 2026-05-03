import { Edge, Polygon } from "./polygon.js";
import { Vec2 } from "./utils.js";

export function sampleEllipticArc(n, a, b, phi1, phi2) {
  // TOOD:
  while (phi2 < phi1) phi2 += 2 * Math.PI;

  const res = [];
  for (let i = 0; i <= n; ++i) {
    res.push(
      new Vec2(
        a * Math.cos(phi1 + (i * (phi2 - phi1)) / n),
        b * Math.sin(phi1 + (i * (phi2 - phi1)) / n)
      )
    );
  }
  return res;
}

export function sampleCircle(n) {
  const res = [];
  for (let i = 0; i < n; ++i) {
    const theta = i * ((2 * Math.PI) / n);
    res.push(new Vec2(Math.cos(theta), Math.sin(theta)));
  }
  return res;
}

// TODO: refactor other functions to return polygons instead of vertices
export function makeRing(r1, r2, n = 30) {
  const edges = [];
  for (let i = 0; i < n; ++i) {
    const theta1 = i * ((2 * Math.PI) / n);
    const theta2 = (i + 1) * ((2 * Math.PI) / n);
    edges.push(
      new Edge(
        new Vec2(Math.cos(theta2), Math.sin(theta2)),
        new Vec2(Math.cos(theta1), Math.sin(theta1))
      ).scale(r1)
    );
    edges.push(
      new Edge(
        new Vec2(Math.cos(theta1), Math.sin(theta1)),
        new Vec2(Math.cos(theta2), Math.sin(theta2))
      ).scale(r2)
    );
  }
  return new Polygon(edges);
}
