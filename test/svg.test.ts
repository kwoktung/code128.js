import { describe, expect, it } from 'vitest'
import type { BarcodeModel } from '../src/index'
import { svg } from '../src/svg'

const model: BarcodeModel = {
    width: 20,
    height: 10,
    bars: [{ x: 2, width: 4 }, { x: 8.5, width: 1.5 }],
    color: '#000',
    background: '#fff'
}

describe('svg()', () => {
    it('renders the 1.x markup structure', () => {
        expect(svg()(model)).toBe(
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="10" viewBox="0 0 20 10" shape-rendering="crispEdges">' +
            '<rect width="100%" height="100%" fill="#fff"/>' +
            '<g fill="#000"><rect x="2" y="0" width="4" height="10"/><rect x="8.5" y="0" width="1.5" height="10"/></g>' +
            '</svg>'
        )
    })

    it('omits the background rect when background is null', () => {
        const out = svg()({ ...model, background: null })
        expect(out).not.toContain('100%')
        expect(out.match(/<rect /g)).toHaveLength(2)
    })

    it('escapes attribute values', () => {
        const out = svg()({ ...model, color: '"/><script>alert(1)</script>', background: 'a&b' })
        expect(out).toContain('fill="&quot;/>&lt;script>alert(1)&lt;/script>"')
        expect(out).toContain('fill="a&amp;b"')
        expect(out).not.toContain('<script')
    })
})
