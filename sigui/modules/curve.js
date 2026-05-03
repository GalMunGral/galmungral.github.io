import { sampleCircle } from "./ellipse.js";
import { Polygon, simplePolygon } from "./polygon.js";

export function makeCurve(points, d, closed = false) {
  if (points.length < 2) return new Polygon();

  const edges = [];

  for (let i = 0; i < points.length; ++i) {
    const { x, y } = points[i];
    edges.push(
      ...simplePolygon(sampleCircle(d * 4))
        .scale(d)
        .translate(x, y).edges
    );
  }

  const end = closed ? points.length : points.length - 1;

  for (let i = 0; i < end; ++i) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];

    const e = p2
      .sub(p1)
      .normalize()
      .rotate(Math.PI / 2);

    edges.push(
      ...simplePolygon([
        p1.add(e.mul(d)),
        p1.add(e.mul(-d)),
        p2.add(e.mul(-d)),
        p2.add(e.mul(d)),
      ]).edges
    );
  }

  return new Polygon(edges);

  // if (points.length < 2) return new Polygon();
  // const n = points.length;
  // const before = closed ? points[n - 1] : points[0].mul(2).sub(points[1]);
  // const after = closed ? points[0] : points[n - 1].mul(2).sub(points[n - 2]);
  // points = [before, ...points, after];

  // const left = [];
  // const right = [];

  // for (let i = 1; i <= n; ++i) {
  //   const { x, y } = points[i];
  //   const e1 = points[i].sub(points[i - 1]).normalize();
  //   const e2 = points[i + 1].sub(points[i]).normalize();
  //   const phi1 = Math.atan2(e1.y, e1.x);
  //   const phi2 = Math.atan2(e2.y, e2.x);
  //   if (e1.cross(e2) >= 0) {
  //     const theta = normalize(phi1 + Math.PI - phi2) / 2;
  //     left.push(
  //       e2
  //         .rotate(theta)
  //         // .scale(d / Math.sin(theta))
  //         .scale(d)
  //         .translate(x, y)
  //     );
  //     right.push(
  //       ...sampleEllipticArc(
  //         10,
  //         d,
  //         d,
  //         phi1 - Math.PI / 2,
  //         phi2 - Math.PI / 2
  //       ).map((p) => p.translate(x, y))
  //     );
  //   } else {
  //     const theta = normalize(phi2 - (phi1 + Math.PI)) / 2;
  //     right.push(
  //       e2
  //         .rotate(-theta)
  //         // .scale(d / Math.sin(theta))
  //         .scale(d)
  //         .translate(x, y)
  //     );
  //     left.push(
  //       ...sampleEllipticArc(10, d, d, phi2 + Math.PI / 2, phi1 + Math.PI / 2)
  //         .map((p) => p.translate(x, y))
  //         .reverse()
  //     );
  //   }
  // }

  // const edges = [];
  // for (let i = 1; i < left.length; ++i) {
  //   edges.push(new Edge(left[i - 1], left[i]));
  // }
  // for (let i = 1; i < right.length; ++i) {
  //   edges.push(new Edge(right[i - 1], right[i]));
  // }

  // if (closed) {
  //   // console.log(new Edge(left[0], left[left.length - 1]));
  //   // console.log(new Edge(right[0], right[right.length - 1]));
  //   edges.push(new Edge(left[0], left[left.length - 1]));
  //   edges.push(new Edge(right[0], right[right.length - 1]));
  // } else {
  //   edges.push(new Edge(left[0], right[0]));
  //   edges.push(new Edge(left[left.length - 1], right[right.length - 1]));
  // }

  // return new Polygon(edges);
}
