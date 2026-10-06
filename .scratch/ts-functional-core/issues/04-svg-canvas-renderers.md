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
