import React from 'react'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'
import { describe, expect, it, vi } from 'vitest'
import { encode, layout, render, type BarcodeModel } from '../src/index'
import { Barcode, views } from '../src/react-native'

// The real package is Flow source and can't load in Node; a host-component
// stand-in is enough to inspect the rendered tree.
vi.mock('react-native', () => ({ View: 'View' }))

// react-test-renderer is deprecated in React 19 and warns about it once.
vi.spyOn(console, 'error').mockImplementation(() => {})

const model: BarcodeModel = {
    width: 20,
    height: 10,
    bars: [{ x: 2, width: 4 }, { x: 8.5, width: 1.5 }],
    color: '#000',
    background: '#fff'
}

function mount(element: React.ReactElement): ReactTestRenderer {
    let renderer!: ReactTestRenderer
    act(() => {
        renderer = create(element)
    })
    return renderer
}

describe('views()', () => {
    it('renders an outer View with absolutely positioned bars', () => {
        const root = mount(views()(model)).toJSON() as any
        expect(root.type).toBe('View')
        expect(root.props.style).toEqual([{ width: 20, height: 10, backgroundColor: '#fff' }, undefined])
        expect(root.children.map((c: any) => c.props.style)).toEqual([
            { position: 'absolute', top: 0, left: 2, width: 4, height: 10, backgroundColor: '#000' },
            { position: 'absolute', top: 0, left: 8.5, width: 1.5, height: 10, backgroundColor: '#000' }
        ])
    })

    it('merges the style option and makes a null background transparent', () => {
        const root = mount(views({ style: { margin: 4 } })({ ...model, background: null })).toJSON() as any
        expect(root.props.style).toEqual([{ width: 20, height: 10, backgroundColor: 'transparent' }, { margin: 4 }])
    })

    it('plugs into render()', () => {
        const root = mount(render('1234', views())).toJSON() as any
        expect(root.children).toHaveLength(layout(encode('1234')).bars.length)
    })
})

describe('<Barcode>', () => {
    it('lays out the value with the core defaults', () => {
        const root = mount(<Barcode value="1234" />).toJSON() as any
        const expected = layout(encode('1234'))
        expect(root.props.style[0]).toEqual({ width: expected.width, height: 50, backgroundColor: '#fff' })
        expect(root.children.map((c: any) => c.props.style.left)).toEqual(expected.bars.map(b => b.x))
    })

    it('passes layout props through, including quietZone', () => {
        const root = mount(
            <Barcode value="1234" unitWidth={1} height={30} color="red" background={null} quietZone={10} style={{ margin: 2 }} />
        ).toJSON() as any
        const expected = layout(encode('1234'), { unitWidth: 1, height: 30, color: 'red', background: null, quietZone: 10 })
        expect(root.props.style).toEqual([{ width: expected.width, height: 30, backgroundColor: 'transparent' }, { margin: 2 }])
        expect(root.children[0].props.style).toMatchObject({ left: 10, height: 30, backgroundColor: 'red' })
    })

    it('treats unset props as defaults', () => {
        const root = mount(<Barcode value="1234" unitWidth={undefined} />).toJSON() as any
        expect(root.props.style[0].width).toBe(layout(encode('1234')).width)
    })
})
