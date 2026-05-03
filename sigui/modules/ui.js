import { blur } from "./blur.js";
import { setup } from "./utils.js";

export class UIRenderer {
  pending = [];
  committed = [];
  postprocessing = [];

  constructor(canvas, root) {
    this.canvas = canvas;
    this.root = root;
    this.focus = null;

    setup(
      canvas,
      (buffer) => {
        if (this.pending.length) {
          this.commit(buffer);
        }
      },
      {
        onClick: (p) => {
          const comp = this.hitTest(p);
          if (comp?.handleClick?.(p)) {
            this.root.render(this);
          }
        },
        onPointerDown: (p) => {
          const comp = this.hitTest(p);
          if (comp?.handlePointerDown?.(p)) {
            this.root.render(this);
          }
        },
        onPointerMove: (p) => {
          const comp = this.hitTest(p);
          let pointerOutHandled = false;
          let pointerOverHandled = false;
          if (this.focus != comp) {
            pointerOutHandled = this.focus?.handlePointerOut?.();
            pointerOverHandled = comp?.handlePointerOver?.();
            this.focus = comp;
          }
          const pointerMoveHandled = comp?.handlePointerMove?.(p);
          if (pointerOutHandled || pointerOverHandled || pointerMoveHandled) {
            this.root.render(this);
          }
        },
        onPointerUp: (p) => {
          const comp = this.hitTest(p);
          if (comp?.handlePointerUp?.(p)) {
            this.root.render(this);
          }
        },
      }
    );

    this.update();
  }

  update() {
    this.root.layout(this.canvas.width / 2, this.canvas.height / 2);
    this.root.render(this);
  }

  hitTest(p) {
    for (const { component, polygon } of this.committed) {
      if (component && polygon.contains(p)) {
        return component;
      }
    }
    return null;
  }

  render(component, polygon, color) {
    this.pending.push({ component, polygon, color });
  }

  blur(polygon) {
    this.postprocessing.push({ type: "blur", polygon });
  }

  commit(buffer) {
    buffer.clear();
    this.pending.forEach(({ polygon, color }) => {
      polygon.fill(buffer, color);
    });
    this.postprocessing.forEach(({ polygon }) => {
      blur(buffer, polygon);
    });
    this.committed = this.pending
      .reverse()
      .filter(({ component }) => component);
    this.pending = [];
    this.postprocessing = [];
  }
}
