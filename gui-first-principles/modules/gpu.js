import { Vec2 } from "./utils.js";

export function drawPolygon(gl, positionBuffer, indexBuffer, paths) {
  const { vertices, triangles } = triangulate(paths);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertices.flatMap(({ x, y }) => [x, y])),
    gl.STATIC_DRAW
  );

  const lines = [];
  let length = triangles.length;
  for (let i = 0; i < length; i += 3) {
    lines.push(triangles[i], triangles[i + 1]);
    lines.push(triangles[i + 1], triangles[i + 2]);
    lines.push(triangles[i + 2], triangles[i]);
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(lines),
    gl.STATIC_DRAW
  );

  gl.lineWidth(0.1);
  gl.drawElements(gl.LINES, lines.length, gl.UNSIGNED_SHORT, 0);
}

function triangulate(paths) {
  const vertices = [];
  const outerLoops = [];
  const innerLoops = [];

  for (let [i, path] of paths.entries()) {
    path = dedupe(path);
    const n = vertices.length;
    vertices.push(...path);

    if (isOuter(path)) {
      const loop = [];
      for (let i = 0; i < path.length; ++i) {
        loop.push(n + i);
      }
      outerLoops.push(loop);
    } else {
      const loop = [];
      for (let i = 0; i < path.length; ++i) {
        loop.push(n + i);
      }
      let k = 0;
      let x = vertices[loop[0]].x;
      for (let i = 0; i < loop.length; ++i) {
        const best = vertices[loop[k]];
        const cur = vertices[loop[i]];
        if (cur.x > best.x || (cur.x == best.x && cur.y > best.y)) {
          k = i;
          x = cur.x;
        }
      }
      innerLoops.push([...loop.slice(k), ...loop.slice(0, k)]);
    }
  }

  innerLoops.sort((a, b) => vertices[a[0]].x - vertices[b[0]].x);

  // eliminate inner loops
  while (innerLoops.length) {
    const inner = innerLoops.pop();
    const o = vertices[inner[0]];

    let minIntersectionX = Infinity;
    let closest = -1;
    let containing;
    for (const outerLoop of outerLoops) {
      for (let i = 0; i < outerLoop.length; ++i) {
        const a = vertices[index(outerLoop, i)];
        const b = vertices[index(outerLoop, i + 1)];
        // clockwise
        if (a.y <= o.y && b.y >= o.y) {
          const intersectionX = a.x + ((b.x - a.x) / (b.y - a.y)) * (o.y - a.y);
          if (intersectionX > o.x && intersectionX < minIntersectionX) {
            minIntersectionX = intersectionX;
            closest = i;
            containing = outerLoop;
          }
        }
      }
    }
    if (closest < 0) throw "not possible";
    let visible = closest;
    const c = new Vec2(minIntersectionX, o.y);
    const m = vertices[containing[closest]];
    for (let i = 0; i < containing.length; ++i) {
      if (
        isInside(o, m, c, vertices[containing[i]]) &&
        vertices[containing[i]].normalize().x >
          vertices[containing[visible]].normalize().x
      ) {
        visible = i;
      }
    }
    const n = vertices.length;
    containing.splice(visible + 1, 0, ...inner, inner[0], containing[visible]);
  }

  const triangles = [];
  const savedOuterLoops = outerLoops.map((x) => [...x]);

  function prev(loop, i) {
    return (i - 1 + loop.length) % loop.length;
  }

  function next(loop, i) {
    return (i + 1) % loop.length;
  }

  for (const outerLoop of outerLoops) {
    // triangulate outside
    let ears = [];
    for (let i = 0; i < outerLoop.length; ++i) {
      if (isEar(outerLoop, i)) {
        ears.push(i);
      }
    }

    while (outerLoop.length > 3 && ears.length) {
      let idx = Math.floor(Math.random() * ears.length);
      let i = ears[idx];
      ears.splice(idx, 1);

      triangles.push(
        outerLoop[prev(outerLoop, i)],
        outerLoop[i],
        outerLoop[next(outerLoop, i)]
      );

      ears = ears
        .filter((x) => x != prev(outerLoop, i) && x != next(outerLoop, i))
        .map((x) => (x < i ? x : x - 1));

      outerLoop.splice(i, 1);
      i %= outerLoop.length;

      if (isEar(outerLoop, i - 1)) {
        ears.push(prev(outerLoop, i));
      }
      if (isEar(outerLoop, i)) {
        ears.push(i);
      }
    }
    if (outerLoop.length == 3) {
      triangles.push(...outerLoop);
      outerLoop.length = 0;
    }
  }

  function index(loop, i) {
    const n = loop.length;
    i %= n;
    if (i < 0) i += n;
    return loop[i];
  }

  function isInside(a, b, c, p) {
    const v0 = b.sub(a);
    const v1 = c.sub(a);
    const v2 = p.sub(a);
    const d00 = v0.dot(v0);
    const d01 = v0.dot(v1);
    const d11 = v1.dot(v1);
    const d20 = v2.dot(v0);
    const d21 = v2.dot(v1);
    const denom = d00 * d11 - d01 * d01;
    const v = (d11 * d20 - d01 * d21) / denom;
    const w = (d00 * d21 - d01 * d20) / denom;
    const u = 1 - v - w;
    return v > -1e-9 && w >= -1e-9 && u >= -1e-9;
  }

  function isConvex(loop, i) {
    return (
      ccw(
        vertices[index(loop, i - 1)],
        vertices[index(loop, i)],
        vertices[index(loop, i + 1)]
      ) > 0
    ); // can't be zero
  }

  function isEar(loop, i) {
    if (!isConvex(loop, i)) return false;
    const cur = index(loop, i);
    const prev = index(loop, i - 1);
    const next = index(loop, i + 1);
    for (let idx of loop) {
      if (
        idx != cur &&
        idx != prev &&
        idx != next &&
        isInside(vertices[prev], vertices[cur], vertices[next], vertices[idx])
      ) {
        return false;
      }
    }
    return true;
  }

  return {
    vertices,
    triangles,
    savedOuterLoops,
  };
}

function dedupe(arr) {
  let j = 1;
  for (let i = 1; i < arr.length; ++i) {
    if (!arr[i].equal(arr[i - 1])) {
      arr[j++] = arr[i];
    }
  }
  arr.length = j;
  if (arr[j - 1].equal(arr[0])) arr.pop();
  return arr;
}

function ccw(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
}

function isOuter(vertices) {
  const n = vertices.length;
  let j = 0;
  for (let i = 0; i < n; ++i) {
    if (
      vertices[i].x < vertices[j].x ||
      (vertices[i].x == vertices[j].x && vertices[i].y < vertices[j].y)
    ) {
      j = i;
    }
  }
  if (j < 0) throw "isOuter impossible";
  // y-axis is flipped, so the sign is the opposite
  return ccw(vertices[(j - 1 + n) % n], vertices[j], vertices[(j + 1) % n]) > 0;
}

function compileShader(gl, shaderSource, shaderType) {
  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    throw "could not compile shader:" + gl.getShaderInfoLog(shader);
  }

  return shader;
}

export function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl, vertexShader, gl.VERTEX_SHADER));
  gl.attachShader(
    program,
    compileShader(gl, fragmentShader, gl.FRAGMENT_SHADER)
  );
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    throw "program failed to link:" + gl.getProgramInfoLog(program);
  }
  return program;
}
