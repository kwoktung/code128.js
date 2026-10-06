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

## Comments

**Done.** `README.md` has been rewritten with:
- a quick start per target (svg, dom, canvas sized via `layout`, `<script>` via unpkg, RN `Barcode`, RN + react-native-svg)
- an options table that includes `quietZone`
- the API and renderer tables
- a "writing your own renderer" section (an HTML `<div>` renderer for email, which also covers the HTML idea from the original request)
- a 1.x → 2.x migration table and a list of behaviour changes

The acceptance check is automated in `test/readme.test.ts`. It extracts every ```ts/```tsx block and type-checks it with `tsc` against `dist/`, importing by package name (through the `exports` map). RN blocks go in a separate program without the DOM lib and with `skipLibCheck`, because RN's globals conflict with DOM and its own `.d.ts` files fail strict checks (RN's default tsconfig skips lib checks too). Canaries (a misspelled option in a web block, and a wrong prop type in an RN block) are caught. The HTML `<script>` block is not checked.

Test infrastructure: `vitest.config.ts` + `test/global-setup.ts` build `dist/` once per run (previously `package.test.ts` built in `beforeAll`, which would have raced with this test). `test/.readme/` is gitignored. The suite has 48 tests.

The README says `{` and `}` are "not supported yet" (see `.scratch/element-table-braces/`). Update it if that table fix lands before release.
