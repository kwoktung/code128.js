import { describe, expect, it } from 'vitest'
import type { BarcodeModel } from '../src/index'
import { canvas, type CanvasContext } from '../src/canvas'

const model: BarcodeModel = {
    width: 20,
    height: 10,
    bars: [{ x: 2, width: 4 }, { x: 8.5, width: 1.5 }],
    color: '#000',
    background: '#fff'
}

function recorder(failOnFill?: number) {
    const calls: unknown[][] = []
    const context: CanvasContext = {
        fillStyle: '',
        save: () => calls.push(['save']),
        restore: () => calls.push(['restore']),
        fillRect(x, y, w, h) {
            calls.push(['fillRect', this.fillStyle, x, y, w, h])
            if (calls.length === failOnFill) throw new Error('boom')
        }
    }
    return { calls, context }
}

describe('canvas(ctx)', () => {
    it('fills the background, then each bar, inside save/restore', () => {
        const { calls, context } = recorder()
        expect(canvas(context)(model)).toBeUndefined()
        expect(calls).toEqual([
            ['save'],
            ['fillRect', '#fff', 0, 0, 20, 10],
            ['fillRect', '#000', 2, 0, 4, 10],
            ['fillRect', '#000', 8.5, 0, 1.5, 10],
            ['restore']
        ])
    })

    it('skips the background when it is null', () => {
        const { calls, context } = recorder()
        canvas(context)({ ...model, background: null })
        expect(calls.filter(c => c[0] === 'fillRect')).toHaveLength(2)
    })

    it('restores the context even if drawing throws', () => {
        const { calls, context } = recorder(3)
        expect(() => canvas(context)(model)).toThrow('boom')
        expect(calls[calls.length - 1]).toEqual(['restore'])
    })

    it('accepts a real CanvasRenderingContext2D', () => {
        // Type-level check: the DOM context must satisfy CanvasContext.
        const accept = (_: CanvasContext) => {}
        accept(null as unknown as CanvasRenderingContext2D)
    })
})
