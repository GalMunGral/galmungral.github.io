export class Vec2 {
  constructor(x, y) {
    if (isNaN(x) || isNaN(y)) {
      throw new Error("invalid coordinates!");
    }
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  equal(other) {
    return (
      Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y)) < 1e-9
    );
    // return this.x === other.x && this.y === other.y;
  }

  norm() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  add(other) {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  sub(other) {
    return new Vec2(this.x - other.x, this.y - other.y);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  cross(other) {
    return this.x * other.y - this.y * other.x;
  }

  normalize() {
    const n = this.norm();
    if (n == 0) throw "Can't normalize zero vector!";
    return this.scale(1 / n);
  }

  dist(other) {
    return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
  }

  translate(dx, dy) {
    return new Vec2(this.x + dx, this.y + dy);
  }

  rotate(theta) {
    return new Vec2(
      this.x * Math.cos(theta) - this.y * Math.sin(theta),
      this.x * Math.sin(theta) + this.y * Math.cos(theta)
    );
  }

  mul(c) {
    return new Vec2(this.x * c, this.y * c);
  }

  scale(c) {
    return new Vec2(this.x * c, this.y * c);
  }

  interpolate(other, t) {
    return new Vec2(
      (1 - t) * this.x + t * other.x,
      (1 - t) * this.y + t * other.y
    );
  }
}

export class Color {
  static WHITE = new Color(1, 1, 1);
  static BLACK = new Color(0, 0, 0);
  static RED = new Color(1, 0, 0);
  static GREEN = new Color(0, 1, 0);
  static BLUE = new Color(0, 0, 1);
  static TRANSPARENT = new Color(0, 0, 0, 0);

  static parse(s) {
    const r = parseInt(s.slice(1, 3), 16) / 255;
    const g = parseInt(s.slice(3, 5), 16) / 255;
    const b = parseInt(s.slice(5, 7), 16) / 255;
    return new Color(r, g, b);
  }

  constructor(r, g, b, a = 1.0) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  add(other) {
    return new Color(
      this.r + other.r,
      this.g + other.g,
      this.b + other.b,
      this.a + other.a
    );
  }

  scale(c) {
    return new Color(this.r * c, this.g * c, this.b * c, this.a * c);
  }

  interpolate(other, t) {
    return new Color(
      (1 - t) * this.r + t * other.r,
      (1 - t) * this.g + t * other.g,
      (1 - t) * this.b + t * other.b,
      (1 - t) * this.a + t * other.a
    );
  }

  over(other) {
    const a = this.a + other.a * (1 - this.a);
    const w1 = this.a / a;
    const w2 = (other.a * (1 - this.a)) / a;
    return new Color(
      this.r * w1 + other.r * w2,
      this.g * w1 + other.g * w2,
      this.b * w1 + other.b * w2,
      a
    );
  }
}

export class Buffer {
  dirty = false;

  constructor(imageData) {
    this.buffer = imageData.data;
    this.width = imageData.width;
    this.height = imageData.height;
  }

  clone() {
    return new Buffer(
      new ImageData(this.buffer.slice(), this.width, this.height)
    );
  }

  composite(buf) {
    for (let x = 0; x < this.width; ++x) {
      for (let y = 0; y < this.height; ++y) {
        this.putPixel(x, y, buf.getPixel(x, y));
      }
    }
  }

  getPixel(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height)
      return Color.WHITE;
    const i = y * this.width + x;
    return new Color(
      this.buffer[i * 4] / 255,
      this.buffer[i * 4 + 1] / 255,
      this.buffer[i * 4 + 2] / 255,
      this.buffer[i * 4 + 3] / 255
    );
  }

  putPixel(x, y, color) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const i = y * this.width + x;
    const prev = new Color(
      ...Array.from(this.buffer.slice(i * 4, (i + 1) * 4)).map((v) => v / 255)
    );
    const { r, g, b, a } = color.over(prev);
    this.buffer[i * 4] = r * 255;
    this.buffer[i * 4 + 1] = g * 255;
    this.buffer[i * 4 + 2] = b * 255;
    this.buffer[i * 4 + 3] = a * 255;
    this.dirty = true;
  }

  clear() {
    this.buffer.fill(0);
    this.dirty = true;
  }
}

export function setup(
  canvas,
  drawFn,
  { onClick, onPointerDown, onPointerUp, onPointerMove } = {},
  dpr
) {
  dpr = dpr ?? devicePixelRatio;
  const width = (canvas.width = canvas.clientWidth * dpr);
  const height = (canvas.height = canvas.clientHeight * dpr);

  const ctx = canvas.getContext("2d");
  const imageData = new ImageData(width, height);

  canvas.addEventListener("pointerdown", (e) => {
    onPointerDown?.(new Vec2(e.offsetX * dpr, e.offsetY * dpr));
  });

  canvas.addEventListener("pointerup", (e) => {
    onPointerUp?.(new Vec2(e.offsetX * dpr, e.offsetY * dpr));
  });

  canvas.addEventListener("pointermove", (e) => {
    onPointerMove?.(new Vec2(e.offsetX * dpr, e.offsetY * dpr));
  });

  canvas.addEventListener("click", (e) => {
    onClick?.(new Vec2(e.offsetX * dpr, e.offsetY * dpr));
  });

  const buffer = new Buffer(imageData);

  let visible = false;
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
    },
    { threshold: 1 }
  ).observe(canvas);

  requestAnimationFrame(function draw(now) {
    if (visible) {
      drawFn(buffer, now);
      if (buffer.dirty) {
        ctx.putImageData(imageData, 0, 0);
        buffer.dirty = false;
      }
    }
    requestAnimationFrame(draw);
  });
}
