import { parse } from "https://unpkg.com/opentype.js/dist/opentype.module.js";
import { createProgram, drawPolygon } from "../modules/gpu.js";
import { sampleBezier } from "../modules/bezier.js";
import { Vec2 } from "../modules/utils.js";

export const FontBook = {
  NotoSans: parse(await (await fetch("./NotoSans.ttf")).arrayBuffer()),
};

const canvas = document.querySelector("#gpu");
const gl = canvas.getContext("webgl2");

const vertexShader = `
uniform float viewportWidth;
uniform float viewportHeight;
uniform float t;
attribute vec3 pos;
varying float vt;

void main() {
  gl_Position = vec4(
    pos.x * 2.0 / viewportWidth - 1.0,
    1.0 - pos.y * 2.0 / viewportHeight,
    pos.z,
    1.0
  );
  gl_PointSize = 2.0;
  vt = t;
}
`;

const fragmentShader = `
precision mediump float;
varying float vt;
 
void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, exp(-0.0003 * (vt + 1000.0)));
}
`;

const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

canvas.width = canvas.clientWidth * devicePixelRatio;
canvas.height = canvas.clientHeight * devicePixelRatio;
gl.viewport(0, 0, canvas.width, canvas.height);

gl.uniform1f(gl.getUniformLocation(program, "viewportWidth"), canvas.width);
gl.uniform1f(gl.getUniformLocation(program, "viewportHeight"), canvas.height);

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.clearColor(1, 1, 1, 1);

const positionLoc = gl.getAttribLocation(program, "pos");
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

const indexBuffer = gl.createBuffer();

const text = "GPU to the rescue!";
const initialSize = 80;

let visible = false;
new IntersectionObserver(
  (entries) => {
    visible = entries[0].isIntersecting;
  },
  { threshold: 1 }
).observe(canvas);

setInterval(() => {
  let start = Date.now();

  requestAnimationFrame(function test() {
    const t = Date.now() - start;

    gl.uniform1f(gl.getUniformLocation(program, "t"), t);
    gl.uniform1f(gl.getUniformLocation(program, "viewportWidth"), canvas.width);
    gl.uniform1f(
      gl.getUniformLocation(program, "viewportHeight"),
      canvas.height
    );

    const size = initialSize;

    if (t > 500) return;

    if (visible) {
      const polygons1 = makeText(
        text,
        canvas.width / 2 - (text.length * size) / 3.8,
        canvas.height / 2,
        size,
        FontBook.NotoSans,
        3
      );
      for (let paths of polygons1) {
        drawPolygon(gl, positionBuffer, indexBuffer, paths);
      }
    }
    requestAnimationFrame(test);
  });
}, 200);

function makeText(text, dx, dy, size, font, r = 20) {
  const polygons = [];
  for (const path of font.getPaths(text, dx, dy, size)) {
    let start = null;
    let prev = null;
    let pathSet = [];
    let currentPath = [];

    for (const cmd of path.commands) {
      switch (cmd.type) {
        case "M": {
          start = prev = new Vec2(cmd.x, cmd.y);
          break;
        }
        case "L": {
          const p = new Vec2(cmd.x, cmd.y);
          currentPath.push(prev);
          prev = p;
          break;
        }
        case "Q": {
          currentPath.push(
            ...sampleBezier(
              [prev, new Vec2(cmd.x1, cmd.y1), new Vec2(cmd.x, cmd.y)],
              r
            )
          );
          prev = new Vec2(cmd.x, cmd.y);
          break;
        }
        case "C": {
          currentPath.push(
            ...sampleBezier(
              [
                prev,
                new Vec2(cmd.x1, cmd.y1),
                new Vec2(cmd.x2, cmd.y2),
                new Vec2(cmd.x, cmd.y),
              ],
              r
            )
          );
          prev = new Vec2(cmd.x, cmd.y);
          break;
        }
        case "Z": {
          currentPath.push(start);
          pathSet.push(currentPath);
          currentPath = [];
          prev = start;
          break;
        }
      }
    }
    polygons.push(pathSet);
  }
  return polygons;
}
