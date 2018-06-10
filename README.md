## code128.js

code128.js is a pure JavaScript library for generating barcodes using HTML5 canvas.

## usage
```
import code128 from 'code128.js'
var code = new Code128('code128')
code.insert(document.body)
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

## license

MIT
