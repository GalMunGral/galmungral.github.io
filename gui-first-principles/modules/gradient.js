import { Vec2 } from "./utils.js";

export const linearGradient = (minY, maxY, color1, color2) => (_, y) =>
  color1.interpolate(color2, (y - minY) / (maxY - minY));

export const radialGradient = (center, radius, color1, color2) => (x, y) => {
  return color1.interpolate(
    color2,
    Math.min(1, new Vec2(x, y).dist(center) / radius)
  );
};
