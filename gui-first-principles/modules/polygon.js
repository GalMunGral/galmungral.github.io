export class Edge {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }

  get reversed() {
    return this.p1.y > this.p2.y;
  }

  get x1() {
    return this.reversed ? this.p2.x : this.p1.x;
  }
  get y1() {
    return this.reversed ? this.p2.y : this.p1.y;
  }
  get x2() {
    return this.reversed ? this.p1.x : this.p2.x;
  }
  get y2() {
    return this.reversed ? this.p1.y : this.p2.y;
  }

  compare(other) {
    return this.y1 == other.y1 ? this.x1 - other.x1 : this.y1 - other.y1;
  }

  translate(dx, dy) {
    return new Edge(this.p1.translate(dx, dy), this.p2.translate(dx, dy));
  }

  rotate(theta) {
    return new Edge(this.p1.rotate(theta), this.p2.rotate(theta));
  }

  scale(c) {
    return new Edge(this.p1.scale(c), this.p2.scale(c));
  }
}

class ActiveEdge {
  constructor(maxY, x, k, reversed) {
    this.maxY = maxY;
    this.x = x;
    this.k = k;
    this.reversed = reversed;
  }
}

// TODO
export class MultiPolygon {
  constructor(polygons = []) {
    this.polygons = polygons;
  }

  translate(dx, dy) {
    return new MultiPolygon(this.polygons.map((p) => p.translate(dx, dy)));
  }

  rotate(theta) {
    return new MultiPolygon(this.polygons.map((p) => p.rotate(theta)));
  }

  scale(c) {
    return new MultiPolygon(this.polygons.map((p) => p.scale(c)));
  }

  contains(p) {
    return this.polygons.some((polygon) => polygon.contains(p));
  }

  fill(buffer, color) {
    this.polygons.forEach((p) => p.fill(buffer, color));
  }
}

export class Polygon {
  _visibleEdges = null;
  constructor(edges = []) {
    this.edges = edges;
  }

  get visibleEdges() {
    if (!this._visibleEdges) {
      this._visibleEdges = this.edges
        // .map((e) => (e.y1 > e.y2 ? new Edge(e.p2, e.p1) : e))
        // ignore edges that don't cross any scan lines
        .filter(({ y1, y2 }) => Math.ceil(y1) < y2)
        .sort((e1, e2) => e1.compare(e2));
    }
    return this._visibleEdges;
  }

  // addEdge(p1, p2) {
  //   if (p1 && p2) {
  //     this.edges.push(new Edge(p1, p2));
  //     this._visibleEdges = null;
  //   }
  //   return this;
  // }

  translate(dx, dy) {
    return new Polygon(this.edges.map((e) => e.translate(dx, dy)));
  }

  rotate(theta) {
    return new Polygon(this.edges.map((e) => e.rotate(theta)));
  }

  scale(c) {
    return new Polygon(this.edges.map((e) => e.scale(c)));
  }

  contains({ x, y }) {
    let winding = 0;
    for (const { x1, y1, x2, y2, reversed } of this.visibleEdges) {
      if (y1 > y) break;
      if (y2 <= y) continue;
      const k = (x2 - x1) / (y2 - y1);
      const z = x1 + k * (y - y1);
      if (z > x) {
        winding += reversed ? -1 : 1;
      }
    }
    return winding != 0;
  }

  fill(buffer, color) {
    if (!this.visibleEdges.length) return;
    let y = Math.ceil(this.visibleEdges[0].y1) - 1;
    let active = [];
    let i = 0;
    do {
      if (active.length & 1) {
        throw "Odd number of intersections. The path is not closed!";
      }
      for (let i = 0, winding = 0; i < active.length; ++i) {
        if (winding) {
          for (let x = Math.ceil(active[i - 1].x); x < active[i].x; ++x) {
            buffer.putPixel(x, y, color(x, y));
          }
        }
        winding += active[i].reversed ? -1 : 1;
      }
      ++y;
      active = active.filter((e) => e.maxY > y);
      for (const edge of active) {
        edge.x += edge.k;
      }
      while (i < this.visibleEdges.length && this.visibleEdges[i].y1 <= y) {
        const { x1, y1, x2, y2, reversed } = this.visibleEdges[i++];
        const k = (x2 - x1) / (y2 - y1);
        active.push(new ActiveEdge(y2, x1 + k * (y - y1), k, reversed));
      }
      active.sort((e1, e2) => e1.x - e2.x);
    } while (active.length || i < this.visibleEdges.length);
  }

  traverse(fn) {
    if (!this.visibleEdges.length) return;
    let y = Math.ceil(this.visibleEdges[0].y1) - 1;
    let active = [];
    let i = 0;
    do {
      if (active.length & 1) {
        throw "Odd number of intersections. The path is not closed!";
      }
      for (let i = 0, winding = 0; i < active.length; ++i) {
        if (winding) {
          for (let x = Math.ceil(active[i - 1].x); x < active[i].x; ++x) {
            fn(x, y);
          }
        }
        winding += active[i].reversed ? -1 : 1;
      }
      ++y;
      active = active.filter((e) => e.maxY > y);
      for (const edge of active) {
        edge.x += edge.k;
      }
      while (i < this.visibleEdges.length && this.visibleEdges[i].y1 <= y) {
        const { x1, y1, x2, y2, reversed } = this.visibleEdges[i++];
        const k = (x2 - x1) / (y2 - y1);
        active.push(new ActiveEdge(y2, x1 + k * (y - y1), k, reversed));
      }
      active.sort((e1, e2) => e1.x - e2.x);
    } while (active.length || i < this.visibleEdges.length);
  }
}

export function simplePolygon(vertices) {
  return new Polygon(
    vertices.map((p, i) => new Edge(p, vertices[(i + 1) % vertices.length]))
  );
}

// export function polygon(vertices) {
//   return [...vertices.keys()]
//     .map((i) => makeEdge(vertices[i], vertices[(i + 1) % vertices.length]))
//     .sort((e1, e2) => (e1[0] == e2[0] ? e1[2] - e2[2] : e1[0] - e2[0]));
// }
