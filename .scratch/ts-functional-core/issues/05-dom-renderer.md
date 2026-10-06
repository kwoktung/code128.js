# 05 dom(target) renderer

Status: ready-for-agent
Blocked by: 03

Part of `.scratch/ts-functional-core/spec.md`.

## What

`src/dom.ts` exports `dom(target: Element): Renderer<SVGSVGElement>`.

- Build the `<svg>` and its `<rect>`s with `document.createElementNS('http://www.w3.org/2000/svg', ...)` and `setAttribute`. No `innerHTML` or DOMParser.
- It produces the same attributes as `svg()`, appends to `target` and returns the svg element.
- `document` is referenced only inside the renderer body, so importing the module does not throw in Node.

## Acceptance

- vitest runs with a jsdom or happy-dom environment for this file only.
- Tests check the element namespace, the attributes, the bar count, that the element is appended to the target, and that a malicious `color` value stays a plain attribute string.

## Comments

**Done.** `src/dom.ts` (`dom(target)`) builds the shared `svgTree` with `createElementNS`/`setAttribute` and appends it to `target`. `test/dom.test.ts` runs under happy-dom (per-file `@vitest-environment`). 37 tests pass, and typecheck and build are green. `dist/dom.cjs` can be required in plain Node.

Notes:
- Nodes are created in `target.ownerDocument` rather than the global `document`, so rendering into an iframe or another document works and the module never touches globals.
- A test parses the `svg()` string with DOMParser and checks that it yields the same tree as `dom()`, so the two renderers can't drift apart.
- happy-dom was added as a dev dependency.
