import type { BarcodeModel } from './index'

// Internal: the SVG structure shared by the `svg` (string) and `dom` (element)
// renderers, so both emit identical markup.

export const SVG_NS = 'http://www.w3.org/2000/svg'

export interface SvgNode {
    tag: 'svg' | 'rect' | 'g'
    attrs: Record<string, string>
    children: SvgNode[]
}

export function svgTree(model: BarcodeModel): SvgNode {
    const { width, height, bars, color, background } = model
    const children: SvgNode[] = []
    if (background) {
        children.push({ tag: 'rect', attrs: { width: '100%', height: '100%', fill: background }, children: [] })
    }
    children.push({
        tag: 'g',
        attrs: { fill: color },
        children: bars.map(bar => ({
            tag: 'rect',
            attrs: { x: String(bar.x), y: '0', width: String(bar.width), height: String(height) },
            children: []
        }))
    })
    return {
        tag: 'svg',
        attrs: {
            width: String(width),
            height: String(height),
            viewBox: `0 0 ${width} ${height}`,
            'shape-rendering': 'crispEdges'
        },
        children
    }
}
