# 0001. Renderers are pure functions over a layout model

- Status: accepted
- Date: 2026-10-06

## Context

Until 1.x the core exported a `Code128` class with `size()`, `draw(context)` and `toSVG()`. `draw` was already an environment abstraction, but it was tied to the Canvas 2D API (`save`/`restore`/`fillStyle`/`fillRect`). Because SVG output and the React Native component did not fit that shape, both bypassed `draw` and read `bars` directly. The result was three renderers built three different ways, and adding a new target (HTML, React Native, Node) meant learning which one to copy.

## Decision

Split the core into a pipeline of pure functions and make a renderer a pure function over a fully computed model:

```ts
encode(input: string): Encoded                       // { input, codes, bits }
layout(encoded: Encoded, opts?: LayoutOptions): BarcodeModel
render<R>(input: string, renderer: Renderer<R>, opts?: LayoutOptions): R

interface Bar { x: number; width: number }           // pixels
interface BarcodeModel {
  width: number; height: number;                     // pixels, including quiet zone
  bars: Bar[];                                       // scaled by unitWidth, offset by quietZone
  color: string; background: string | null;
}
type Renderer<R> = (model: BarcodeModel) => R
```

- `layout` owns all geometry and colour: `unitWidth` (default 2), `height`, `color`, `background`, `quietZone` (in modules, default 0). Coordinates are not rounded; rounding is up to each renderer.
- Renderer-specific configuration is captured by a factory closure (`canvas(ctx)`, `dom(target)`, `svg()`, `views({ style })`) rather than being added to the layout options.
- The return type comes from the renderer: `svg()` returns a string, `canvas(ctx)` returns `void`, `dom(target)` returns an `SVGSVGElement`, and `views()` returns a React element.

The class API is removed in 2.0.0 with no compatibility shim.

## Alternatives considered

- **Drawing primitives** (`env.rect(x, y, w, h, color)`, called by the core): this suits Canvas, but string- and element-producing targets would have to accumulate state and expose the result out of band.
- **Lifecycle hooks** (`begin` / `bar` / `end`): these are only useful for streaming or huge outputs, which barcodes don't need.
- **`render(): void`**: this cannot return SVG strings or React elements without side channels. `void` is just the Canvas case of `R`.

## Consequences

- Any target can be supported by writing one small function, and it can be tested without a DOM or canvas.
- `encode` and `layout` are public, so callers can memoise encoding (for example a React Native `useMemo`) or build exotic renderers from `bits`.
- This is a breaking change: `new Code128(x)`, `.insert()`, `.draw()`, `.toSVG()` and the `"react-native"` field resolution all go away. A migration guide is required.
