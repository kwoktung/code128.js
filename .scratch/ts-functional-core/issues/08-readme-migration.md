# 08 README + 1.x → 2.0 migration guide

Status: ready-for-agent
Blocked by: 07

Part of `.scratch/ts-functional-core/spec.md`.

## What

Rewrite `README.md` around the functional API:

- Quick start for each target: `svg`, `canvas`, `dom`, `<script>` global and React Native.
- A "Writing your own renderer" section showing the `BarcodeModel` and `Renderer<R>` types with a short example.
- An options table that includes `quietZone`.
- A **Migrating from 1.x** section:
  - `new Code128(x).insert(el, o)` → `render(x, dom(el), o)` (now inserts an `<svg>`, not a `<canvas>`)
  - `.draw(ctx, o)` → `render(x, canvas(ctx), o)`
  - `.toSVG(o)` → `render(x, svg(), o)`
  - `.bars` / `.bits` → `layout(encode(x), o).bars` / `encode(x).bits`
  - RN: `import { Barcode } from 'code128.js/react-native'`, because the implicit `"react-native"` resolution has been removed
  - the default `unitWidth` is now 2
  - unsupported characters now throw a descriptive error

## Acceptance

- Every snippet in the README compiles against the built types (a doc test or a manual check noted in the PR).
