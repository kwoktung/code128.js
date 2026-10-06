## code128.js

code128.js is a pure JavaScript library for generating Code128 barcodes in the browser and in React Native.

The encoder (`code128.js/dist/core`) has no platform dependencies; each environment gets a thin renderer on top of it.

## browser

```
import Code128 from 'code128.js'
var code = new Code128('code128')
code.insert(document.body, { unitWidth: 2, height: 60 })
```

OR

```
<!DOCTYPE html>
<html>
  <body>
    <script src="/path/to/code128.js"></script>
    <script>
      (function() {
        var code = new Code128('code128')
        code.insert(document.body)
      })();
    </script>
  </body>
</html>
```

## react native

Metro resolves `code128.js` to the React Native build automatically. The `Barcode` component renders with plain `View`s, so no native module is required.

```
import { Barcode } from 'code128.js'

<Barcode value="code128" unitWidth={2} height={60} />
```

If you already use `react-native-svg`, you can render the SVG string instead:

```
import Code128 from 'code128.js'
import { SvgXml } from 'react-native-svg'

<SvgXml xml={new Code128('code128').toSVG({ unitWidth: 2 })} />
```

## api

`new Code128(input)` exposes:

- `elements` – encoded Code128 symbols
- `bits` – module string, e.g. `'11010010000...'`
- `bars` – black bars as `[{ x, width }]` in module units, for custom renderers
- `size(options)` – `{ width, height }` in pixels
- `draw(context, options)` – draw onto any `CanvasRenderingContext2D`-compatible context
- `toSVG(options)` – SVG markup string
- `insert(target, options)` – browser only, appends a `<canvas>` to `target`

`options`: `unitWidth` (default `1`), `height` (default `50`), `color` (default `'#000'`), `background` (default `'#fff'`, pass `null` for transparent).

## license

MIT
