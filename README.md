## code128.js

Code128 barcode generation with pluggable renderers, for the browser, Node and React Native.

The core turns a string into a plain layout model. A **renderer** is a function from that model to whatever your environment needs: an SVG string, pixels on a canvas, a DOM element, React Native views, or anything you write yourself.

```
npm install code128.js
```

Upgrading from 1.x? See [docs/1.x.md](docs/1.x.md).

## quick start

### SVG string (browser, Node, server rendering)

```ts
import { render } from 'code128.js'
import { svg } from 'code128.js/svg'

const markup: string = render('code128', svg(), { height: 60 })
```

### DOM (inline `<svg>` element)

```ts
import { render } from 'code128.js'
import { dom } from 'code128.js/dom'

const element: SVGSVGElement = render('code128', dom(document.body))
```

### canvas

`canvas(ctx)` accepts any `CanvasRenderingContext2D`-compatible context (browser, node-canvas, react-native-canvas, ...). Use `layout` to size the canvas before drawing:

```ts
import { encode, layout } from 'code128.js'
import { canvas } from 'code128.js/canvas'

const model = layout(encode('code128'), { unitWidth: 3 })
const element = document.createElement('canvas')
element.width = model.width
element.height = model.height
canvas(element.getContext('2d')!)(model)
```

### `<script>` tag

```html
<script src="https://unpkg.com/code128.js@2"></script>
<script>
  Code128.render('code128', Code128.dom(document.body))
</script>
```

The global `Code128` exposes `encode`, `layout`, `render`, `svg`, `canvas` and `dom`.

### React Native

The `Barcode` component renders with plain `View`s, so no native module is required.

```tsx
import React from 'react'
import { Barcode } from 'code128.js/react-native'

export const Label = () => <Barcode value="code128" height={60} quietZone={10} />
```

If you already use `react-native-svg`, render the SVG string instead:

```tsx
import React from 'react'
import { SvgXml } from 'react-native-svg'
import { render } from 'code128.js'
import { svg } from 'code128.js/svg'

export const Label = () => <SvgXml xml={render('code128', svg())} />
```

## options

Every renderer takes the same layout options, passed to `render` or `layout` (or as `Barcode` props):

| option | default | description |
| --- | --- | --- |
| `unitWidth` | `2` | width of one module in pixels; fractions are allowed |
| `height` | `50` | bar height in pixels |
| `color` | `'#000'` | bar color |
| `background` | `'#fff'` | background color, `null` for transparent |
| `quietZone` | `0` | blank modules on each side (scanners usually want at least `10`) |

Supported input is printable ASCII (space through `~`). Other characters throw, for example `Unsupported character "中" at index 2`.

## api

```ts
import { encode, layout, render } from 'code128.js'
import type { BarcodeModel, Encoded, LayoutOptions, Renderer } from 'code128.js'

const encoded: Encoded = encode('code128')        // { input, codes, bits }
const model: BarcodeModel = layout(encoded, {})   // { width, height, bars, color, background }
const length: number = render('code128', (m: BarcodeModel) => m.bars.length)
```

- `encode(input)` returns the Code128 symbol values (`codes`: start, data including code-set switches, checksum, stop) and the module string (`bits`, `'1'` = bar). It switches between code sets A, B and C wherever that makes the barcode narrower. For example, Code C packs two digits per symbol, so `SN20261006123456` is about 30% narrower than encoding it entirely in Code B.
- `layout(encoded, options)` turns `bits` into bars in pixels: `bars` is `[{ x, width }]`, already scaled by `unitWidth` and offset by `quietZone`, and `width`/`height` are the total size.
- `render(input, renderer, options)` is `renderer(layout(encode(input), options))` and returns whatever the renderer returns.

| renderer | import | returns |
| --- | --- | --- |
| `svg()` | `code128.js/svg` | SVG markup `string` |
| `canvas(ctx)` | `code128.js/canvas` | `void` (draws at the context's origin) |
| `dom(target)` | `code128.js/dom` | the `SVGSVGElement` appended to `target` |
| `views({ style })` | `code128.js/react-native` | a React Native element (used by `Barcode`) |

## writing your own renderer

A renderer is just `(model: BarcodeModel) => R`, so supporting a new environment means writing one function. For example, an HTML renderer for email templates that don't allow SVG:

```ts
import { render, type Renderer } from 'code128.js'

const html = (): Renderer<string> => ({ width, height, bars, color, background }) =>
    `<div style="position:relative;width:${width}px;height:${height}px;background:${background ?? 'transparent'}">` +
    bars.map(bar => `<div style="position:absolute;top:0;left:${bar.x}px;width:${bar.width}px;height:${height}px;background:${color}"></div>`).join('') +
    `</div>`

const markup = render('code128', html())
```

## license

MIT
