import { parse } from "https://unpkg.com/opentype.js/dist/opentype.module.js";
import { sampleBezier } from "./bezier.js";
import { Edge, MultiPolygon, Polygon } from "./polygon.js";
import { Vec2 } from "./utils.js";

export const FontBook = {
  NotoSans: parse(await (await fetch("./NotoSans.ttf")).arrayBuffer()),
  Arizonia: parse(await (await fetch("./Arizonia.ttf")).arrayBuffer()),
};

export function makeText(text, dx, dy, size, font) {
  const polygons = [];
  let start = null;
  let prev = null;

  for (const path of font.getPaths(text, dx, dy, size)) {
    const edges = [];
    for (const cmd of path.commands) {
      switch (cmd.type) {
        case "M": {
          start = prev = new Vec2(cmd.x, cmd.y);
          break;
        }
        case "L": {
          const p = new Vec2(cmd.x, cmd.y);
          edges.push(new Edge(prev, p));
          prev = p;
          break;
        }
        case "Q": {
          const vertices = sampleBezier([
            prev,
            new Vec2(cmd.x1, cmd.y1),
            new Vec2(cmd.x, cmd.y),
          ]);
          for (const p of vertices) {
            edges.push(new Edge(prev, p));
            prev = p;
          }
          break;
        }
        case "C": {
          const vertices = sampleBezier([
            prev,
            new Vec2(cmd.x1, cmd.y1),
            new Vec2(cmd.x2, cmd.y2),
            new Vec2(cmd.x, cmd.y),
          ]);
          for (const p of vertices) {
            edges.push(new Edge(prev, p));
            prev = p;
          }
          break;
        }
        case "Z": {
          edges.push(new Edge(prev, start));
          break;
        }
      }
      polygons.push(new Polygon(edges));
    }
  }
  return new MultiPolygon(polygons);
}
