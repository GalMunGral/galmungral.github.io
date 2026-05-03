import { Color } from "./utils.js";

export function getGaussianKernel1D(sigma) {
  const k = 3 * sigma;
  const res = [];
  for (let x = -k; x <= k; ++x) {
    res.push(
      (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * (x / sigma) ** 2)
    );
  }
  const sum = res.reduce((s, w) => s + w);
  for (let i = 0; i < res.length; ++i) {
    res[i] /= sum;
  }
  return res;
}

export function blur(buffer, polygon, kernel) {
  const k = kernel.length >> 1;
  const { width, height } = buffer;

  const convolution1D = buffer.clone();

  polygon.traverse((x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    let color = Color.TRANSPARENT;
    for (let i = -k; i <= k; ++i) {
      if (x + i >= 0 && x + i < width) {
        color = color.add(buffer.getPixel(x + i, y).scale(kernel[k + i]));
      }
    }
    convolution1D.putPixel(x, y, color);
  });

  polygon.traverse((x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    let color = Color.TRANSPARENT;
    for (let i = -k; i <= k; ++i) {
      if (y + i >= 0 && y + i < height) {
        color = color.add(
          convolution1D.getPixel(x, y + i).scale(kernel[k + i])
        );
      }
    }
    buffer.putPixel(x, y, color);
  });
}
