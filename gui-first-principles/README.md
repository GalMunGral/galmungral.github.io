# Graphical User Interfaces: First Principles

**Live demo:** https://hwenchi.github.io/gui-first-principles/

## Rhetorical Design

### Purpose

Every programmer builds on top of rendering infrastructure they rarely look into.
Buttons, sliders, font styles, drop shadows — these feel like design primitives,
but underneath each one is pixels computed from geometry. This project
demonstrates that the full pipeline, from filling a polygon to rendering a
typeface to applying a blur, reduces to a small set of operations: scan-line
rasterization, linear interpolation, matrix multiplication, and convolution.
None of it requires specialized machinery.

### Strategy

**Interactive article.** Each section introduces a concept through prose and
mathematics, then immediately embeds a live canvas where the reader can
manipulate the parameters and verify the claim. The progression is incremental —
each concept builds on the previous — so by the time the reader reaches font
rendering and GPU acceleration, every piece of it is already familiar.

[michelangelo](https://github.com/hwenchi/michelangelo) builds a GUI
component framework directly on top of the primitives introduced here.
[vector-rendering](https://github.com/hwenchi/vector-rendering) explores what
changes when GPU hardware enters the pipeline.
[svg.c](https://github.com/hwenchi/svg.c) implements the same rasterization
pipeline in C, applied to a real-world format.