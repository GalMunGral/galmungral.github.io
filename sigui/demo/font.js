import { Color, setup } from "../modules/utils.js";
import { FontBook, makeText } from "../modules/font.js";
import { parse } from "https://unpkg.com/opentype.js/dist/opentype.module.js";

const canvas = document.querySelector("#font");
const inputSize = document.querySelector("#font-size");
const fontInput = document.querySelector("#font-file");

const text = "Everything is a polygon!";

const highlightColor = new Color(0.6, 0.0, 0.0);

let font = FontBook.Arizonia;

let dirty = true;

inputSize.oninput = () => {
  dirty = true;
};

fontInput.oninput = async () => {
  font = parse(await fontInput.files[0].arrayBuffer());
  dirty = true;
};

let pointerInside = false;

setup(
  canvas,
  (buffer) => {
    if (dirty) {
      dirty = false;
      buffer.clear();
      const textBoundary = makeText(
        text,
        100,
        buffer.height / 2,
        +inputSize.value * devicePixelRatio,
        font
      );
      textBoundary.fill(buffer, () =>
        pointerInside ? highlightColor : Color.BLACK
      );
    }
  },
  {},
  1.5
);
