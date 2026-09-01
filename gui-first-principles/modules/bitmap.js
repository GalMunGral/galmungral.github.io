import { Buffer } from "./utils.js";

export function loadBitmap(url) {
  let _resolve;
  const img = new Image();
  img.src = url;
  img.onload = () => {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    _resolve(new Buffer(ctx.getImageData(0, 0, width, height)));
  };
  return new Promise((resolve) => (_resolve = resolve));
}

export function sampleBitmap(buffer, u, v) {
  const { width, height } = buffer;
  return buffer.getPixel(Math.floor(u * width), Math.floor(v * height));
}
