import { describe, expect, it } from 'vitest'
import { encode, layout, render, type BarcodeModel, type Encoded } from '../src/index'
import golden from './fixtures/golden.json'

describe('encode', () => {
    it('exposes symbol values: start, data, checksum, stop', () => {
        // StartC 105, "12", "34", checksum (105 + 12*1 + 34*2) % 103 = 82, Stop 106
        expect(encode('1234')).toEqual({
            input: '1234',
            codes: [105, 12, 34, 82, 106],
            bits: golden.find(g => g.input === '1234')!.bits
        })
    })

    it('switches code sets mid-input', () => {
        // StartB, "S", "N", CODEC (99), "20", "26", checksum, Stop
        expect(encode('SN2026').codes.slice(0, 6)).toEqual([104, 51, 46, 99, 20, 26])
    })

    // Shortest-encoding and round-trip properties live in code-sets.test.ts.

    it('encodes every printable ASCII character', () => {
        for (let c = 32; c <= 126; c++) {
            const char = String.fromCharCode(c)
            expect(() => encode(`a${char}`), JSON.stringify(char)).not.toThrow()
        }
    })

    it('encodes braces with their own Code B symbols', () => {
        // StartB, "{" 91, "[" 59, "}" 93, "]" 61, checksum, Stop
        expect(encode('{[}]').codes.slice(0, 5)).toEqual([104, 91, 59, 93, 61])
    })

    it('requires input', () => {
        expect(() => encode('')).toThrow('Input Required')
    })

    it('reports unsupported characters with their index', () => {
        expect(() => encode('ab中c')).toThrow('Unsupported character "中" at index 2')
        expect(() => encode('a\nb')).toThrow('Unsupported character "\\n" at index 1')
    })
})

describe('layout', () => {
    const encoded: Encoded = { input: 'x', codes: [], bits: '1101001' }

    it('applies defaults', () => {
        expect(layout(encoded)).toEqual({
            width: 14,
            height: 50,
            bars: [{ x: 0, width: 4 }, { x: 6, width: 2 }, { x: 12, width: 2 }],
            color: '#000',
            background: '#fff'
        })
    })

    it('scales by unitWidth without rounding', () => {
        const model = layout(encoded, { unitWidth: 1.5 })
        expect(model.width).toBe(10.5)
        expect(model.bars).toEqual([{ x: 0, width: 3 }, { x: 4.5, width: 1.5 }, { x: 9, width: 1.5 }])
    })

    it('offsets bars and widens the model by the quiet zone', () => {
        const model = layout(encoded, { unitWidth: 1, quietZone: 10 })
        expect(model.width).toBe(27)
        expect(model.bars[0]).toEqual({ x: 10, width: 2 })
        expect(model.bars[model.bars.length - 1]).toEqual({ x: 16, width: 1 })
    })

    it('keeps a null background and passes colors through', () => {
        const model = layout(encoded, { background: null, color: 'red', height: 30 })
        expect(model).toMatchObject({ background: null, color: 'red', height: 30 })
    })

    it('treats explicit undefined options as unset', () => {
        expect(layout(encoded, { unitWidth: undefined, background: undefined })).toEqual(layout(encoded))
    })
})

describe('render', () => {
    it('returns whatever the renderer returns', () => {
        let received: BarcodeModel | undefined
        const result = render('1234', model => {
            received = model
            return 'rendered'
        }, { unitWidth: 3 })
        expect(result).toBe('rendered')
        expect(received).toEqual(layout(encode('1234'), { unitWidth: 3 }))
    })
})
