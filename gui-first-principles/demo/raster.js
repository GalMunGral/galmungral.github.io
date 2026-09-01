import { Color, Vec2, setup } from "../modules/utils.js";

const canvas = document.querySelector("#raster");

let dirty = true;
setup(
  canvas,
  (buffer) => {
    if (dirty) {
      dirty = false;
      for (let x = 0; x < buffer.width; ++x) {
        for (let y = 0; y < buffer.height; ++y) {
          buffer.putPixel(
            x,
            y,
            new Color(Math.random(), Math.random(), Math.random(), 1.0)
          );
        }
      }
    }
  },
  {
    onClick(p) {
      dirty = true;
    },
  }
);
