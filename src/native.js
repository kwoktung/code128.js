import React from 'react'
import { View } from 'react-native'
import Code128 from './core'

// React Native entry: renders bars with plain Views, so no native module
// (react-native-svg, canvas, ...) is required.
function Barcode({ value, unitWidth = 2, height = 50, color = '#000', background = '#fff', style }) {
    const code = React.useMemo(() => new Code128(value), [value])
    const { width } = code.size({ unitWidth })
    return React.createElement(
        View,
        { style: [{ width, height, backgroundColor: background }, style] },
        code.bars.map(bar => React.createElement(View, {
            key: bar.x,
            style: {
                position: 'absolute',
                top: 0,
                left: bar.x * unitWidth,
                width: bar.width * unitWidth,
                height,
                backgroundColor: color
            }
        }))
    )
}

export { Barcode }
export default Code128
