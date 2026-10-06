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
