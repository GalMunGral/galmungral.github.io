import { Color, setup } from "../modules/utils.js";
import { simplePolygon } from "../modules/polygon.js";
import { makeRing, sampleCircle } from "../modules/ellipse.js";
import { blur, getGaussianKernel1D } from "../modules/blur.js";
import { loadBitmap, sampleBitmap } from "../modules/bitmap.js";

const bitmap = await loadBitmap("wave.jpg");
const padding = 0;

const canvas = document.querySelector("#glass");
const sigmaInput = document.querySelector("#sigma");

let kernel = getGaussianKernel1D(+sigmaInput.value);

const lensSize = 80;
const frameSize = 20;
const glass = simplePolygon(sampleCircle(30)).scale(lensSize);
const outline = makeRing(lensSize, lensSize + frameSize);

let x = 100;
let y = 100;

let dirty = true;
let dragging = false;
let prev;

sigmaInput.oninput = () => {
  kernel = getGaussianKernel1D(+sigmaInput.value);
  dirty = true;
};

let cache;

setup(
  canvas,
  (buffer) => {
    if (dirty) {
      dirty = false;

      if (!cache) {
        for (let x = padding; x < buffer.width - padding; ++x) {
          for (let y = padding; y < buffer.height - padding; ++y) {
            buffer.putPixel(
              x,
              y,
              sampleBitmap(
                bitmap,
                (x - padding) / (buffer.width - 2 * padding),
                (y - padding) / (buffer.height - 2 * padding)
              )
            );
          }
        }
        cache = buffer.clone();
      }

      buffer.buffer.set(cache.buffer);

      // frosted glass effect
      const frameColor = new Color(0, 0, 0, 0.8);
      outline.translate(x, y).fill(buffer, () => frameColor);
      blur(buffer, glass.translate(x, y), kernel);
    }
  },
  {
    onPointerDown(p) {
      if (glass.translate(x, y).contains(p)) {
        dragging = true;
        prev = p;
      }
    },
    onPointerUp() {
      dragging = false;
    },
    onPointerMove(p) {
      if (dragging) {
        x += p.x - prev.x;
        y += p.y - prev.y;
        prev = p;
        dirty = true;
      }
    },
  }
);
