import React, { useMemo } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'
import { encode, layout, type LayoutOptions, type Renderer } from './index'

// React Native renderer: bars are absolutely positioned plain Views, so no
// native module (react-native-svg, canvas, ...) is required.

export interface ViewsOptions {
    /** Merged onto the outer View. */
    style?: StyleProp<ViewStyle>
}

/** Render to a React Native element tree. */
export function views({ style }: ViewsOptions = {}): Renderer<React.ReactElement> {
    return ({ width, height, bars, color, background }) => (
        <View style={[{ width, height, backgroundColor: background ?? 'transparent' }, style]}>
            {bars.map(bar => (
                <View
                    key={bar.x}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: bar.x,
                        width: bar.width,
                        height,
                        backgroundColor: color
                    }}
                />
            ))}
        </View>
    )
}

export interface BarcodeProps extends LayoutOptions {
    value: string
    style?: StyleProp<ViewStyle>
}

export function Barcode({ value, style, ...options }: BarcodeProps): React.ReactElement {
    const encoded = useMemo(() => encode(value), [value])
    return views({ style })(layout(encoded, options))
}
