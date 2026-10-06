# Spec: TypeScript rewrite with a functional core (v2.0.0)

Design rationale: `docs/adr/0001-renderer-as-pure-function.md`.

## Goal

Replace the `Code128` class with a TypeScript pipeline (`encode` → `layout` → renderer) so that any environment can render a barcode by implementing `Renderer<R> = (model: BarcodeModel) => R`. Ship this as **2.0.0**, a breaking change with no compatibility layer.

## Public API

### `code128.js` (core, zero platform dependencies)

```ts
interface Encoded { input: string; codes: number[]; bits: string }
interface LayoutOptions {
  unitWidth?: number;          // default 2 (was 1 in core, 2 in RN)
  height?: number;             // default 50
  color?: string;              // default '#000'
  background?: string | null;  // default '#fff', null = transparent
  quietZone?: number;          // modules on each side, default 0
}
interface Bar { x: number; width: number }
interface BarcodeModel { width: number; height: number; bars: Bar[]; color: string; background: string | null }
type Renderer<R> = (model: BarcodeModel) => R

encode(input: string): Encoded
layout(encoded: Encoded, opts?: LayoutOptions): BarcodeModel
render<R>(input: string, renderer: Renderer<R>, opts?: LayoutOptions): R
```

- `Encoded.codes` holds Code128 symbol values (start, data, checksum, stop). Raw `ELEMENT_TABLE` rows are no longer exposed.
- Coordinates are not rounded.
- `encode` output (`bits`) must match 1.x **bit for bit**. The only behaviour change is that an unsupported character throws `Unsupported character "<c>" at index <i>` instead of an opaque `TypeError`. Empty input still throws.

### Subpath renderers

| Subpath | Export | Returns | Notes |
| --- | --- | --- | --- |
| `code128.js/svg` | `svg()` | `string` | Escape `&`, `"` and `<` in attribute values; keep `shape-rendering="crispEdges"` |
| `code128.js/canvas` | `canvas(ctx)` | `void` | Any `CanvasRenderingContext2D`-compatible context; `save`/`restore` around drawing |
| `code128.js/dom` | `dom(target)` | `SVGSVGElement` | Builds nodes with `createElementNS` (no string parsing), appends to `target` |
| `code128.js/react-native` | `<Barcode>`, `views({ style })` | React element | Props: `value unitWidth height color background quietZone style`; implemented via `render(value, views(...), opts)` with `useMemo`; `react`/`react-native` remain optional peers |

## Build & packaging

- TypeScript, target ES2018, `engines.node >= 18`, no `"type": "module"`.
- **tsup** replaces babel 6 and rollup 0.59. It emits ESM (`.mjs`), CJS (`.cjs`) and `.d.ts` for each subpath.
- `package.json` `exports` maps `.`, `./svg`, `./canvas`, `./dom` and `./react-native` (each with `types`/`import`/`require`). The `"react-native"` and `"main"` resolution hacks are removed (`main`/`types` are kept only as fallbacks to `.`).
- IIFE bundle `dist/code128.global.js` sets `window.Code128 = { encode, layout, render, svg, canvas, dom }` for `<script>` users.

## Testing

- **vitest** replaces jasmine.
- Golden fixture: before any rewrite, generate `bits` from the current `dist/core.js` for a fixed input set and commit them as a fixture. The new `encode` must reproduce every entry exactly.
- Each renderer is unit tested against a hand-built `BarcodeModel`. `dom` runs under jsdom/happy-dom, and the RN component runs with a react-test-renderer or a mocked `react-native`.

## Out of scope

- Human-readable text under the bars.
- An HTML-string or `<div>`-based renderer.
- Optimal code-set switching and the Code A vs B choice: see `.scratch/code-set-switching/`.

## Tickets

1. `01-golden-fixture.md`
2. `02-ts-tsup-vitest-scaffold.md`
3. `03-core-encode-layout-render.md`
4. `04-svg-canvas-renderers.md`
5. `05-dom-renderer.md`
6. `06-react-native.md`
7. `07-exports-iife.md`
8. `08-readme-migration.md`
