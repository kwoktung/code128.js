# 04 svg() and canvas(ctx) renderers

Status: ready-for-agent
Blocked by: 03

Part of `.scratch/ts-functional-core/spec.md`.

## What

- `src/svg.ts` exports `svg(): Renderer<string>`. The output has the same structure as the 1.x `toSVG` (`width`/`height`/`viewBox`, `shape-rendering="crispEdges"`, an optional background rect, and a `<g fill>` with one rect per bar). Escape `&`, `"` and `<` in every interpolated attribute value.
- `src/canvas.ts` exports `canvas(ctx): Renderer<void>` and accepts a minimal structural type (`save`, `restore`, `fillStyle`, `fillRect`) so that node-canvas and react-native-canvas typecheck too. It fills the background (if any), then the bars, inside `save`/`restore`, and restores even if drawing throws.

## Acceptance

- Unit tests run against a hand-built `BarcodeModel` (not through `encode`).
- An escaping test checks that `color: '"/><script>'` produces no raw `"` or `<` in the attribute.
- The canvas test uses a recording mock context and checks the call order and arguments.

## Comments

**Done.** `src/svg.ts` (`svg()`) and `src/canvas.ts` (`canvas(ctx)`, plus the `CanvasContext` type) are in place, with tests in `test/svg.test.ts` and `test/canvas.test.ts`. 32 tests pass, and typecheck and build are green.

Notes:
- The SVG structure lives in the internal module `src/svg-tree.ts` (`svgTree(model)` returns a node tree). `svg()` serializes it, and ticket 05's `dom()` should build elements from the same tree so that both outputs stay identical.
- The markup is byte-identical in structure to 1.x `toSVG` (attribute order, background rect, `<g fill>`). The escaping covers `&`, `"` and `<`.
- `CanvasContext.fillStyle` is typed `string | object` rather than referencing `CanvasGradient`/`CanvasPattern`, so the published `.d.ts` doesn't require the DOM lib (useful for node-canvas users). A type-level test checks that `CanvasRenderingContext2D` is assignable to it.
