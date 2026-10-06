# 03 Core: encode / layout / render

Status: ready-for-agent
Blocked by: 02

Part of `.scratch/ts-functional-core/spec.md`.

## What

Implement `src/index.ts` exporting `encode`, `layout`, `render` and the types `Encoded`, `LayoutOptions`, `Bar`, `BarcodeModel` and `Renderer` exactly as in the spec.

- `encode`: port the 1.x logic unchanged. Return `{ input, codes, bits }`. Throw `Input Required` on empty input and `Unsupported character "<c>" at index <i>` when a lookup misses.
- `layout`: defaults `unitWidth: 2`, `height: 50`, `color: '#000'`, `background: '#fff'`, `quietZone: 0`. Collapse `bits` into runs (the 1.x `toBars`), scale by `unitWidth` and offset by `quietZone * unitWidth`. `width = (bits.length + 2 * quietZone) * unitWidth`. No rounding.
- `render(input, renderer, opts) = renderer(layout(encode(input), opts))`.
- No reference to `document`, `window` or any platform API.

## Acceptance

- The golden test passes: `encode(input).bits` equals `golden.json` for every entry.
- There are tests for the error messages, the defaults, the quietZone offset and width, a fractional unitWidth, `background: null`, and that `render` returns what the renderer returns.

## Comments

**Done.** `src/index.ts` exports `encode`, `layout`, `render` and the `Encoded`, `LayoutOptions`, `Bar`, `BarcodeModel` and `Renderer` types. `test/index.test.ts` has 23 tests, including all 13 golden entries matching bit for bit. The built `dist/index.{cjs,mjs}` loads in plain Node and contains no `document` or `window` references.

Notes:
- `layout` ignores options that are explicitly `undefined` (unlike plain object spread or 1.x `Object.assign`), so a wrapper such as the RN component can forward unset props safely. `background: null` is still honoured as transparent.
- The `{`/`}` table bug (`.scratch/element-table-braces/`) is **not** fixed here. Those characters now throw `Unsupported character "{" at index N` instead of a `TypeError`.
- `tsconfig.json` gains `resolveJsonModule` so the test can import the golden fixture.
