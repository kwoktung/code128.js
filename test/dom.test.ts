// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { render, type BarcodeModel } from '../src/index'
import { dom } from '../src/dom'
import { svg } from '../src/svg'

const SVG_NS = 'http://www.w3.org/2000/svg'

const model: BarcodeModel = {
    width: 20,
    height: 10,
    bars: [{ x: 2, width: 4 }, { x: 8.5, width: 1.5 }],
    color: '#000',
    background: '#fff'
}

describe('dom(target)', () => {
    it('appends an SVG-namespaced <svg> to the target and returns it', () => {
        const target = document.createElement('div')
        const element = dom(target)(model)
        expect(target.firstChild).toBe(element)
        expect(element.namespaceURI).toBe(SVG_NS)
        expect(element.tagName.toLowerCase()).toBe('svg')
        for (const node of element.querySelectorAll('*')) expect(node.namespaceURI).toBe(SVG_NS)
    })

    it('sets the same attributes as svg()', () => {
        const element = dom(document.createElement('div'))(model)
        expect(element.getAttribute('width')).toBe('20')
        expect(element.getAttribute('viewBox')).toBe('0 0 20 10')
        expect(element.getAttribute('shape-rendering')).toBe('crispEdges')
        expect(element.querySelector('g')!.getAttribute('fill')).toBe('#000')
        expect(element.querySelectorAll('g > rect')).toHaveLength(2)
        expect(element.querySelector('g > rect')!.getAttribute('x')).toBe('2')

        // Parsing the svg() string yields the same element tree.
        const parsed = new DOMParser().parseFromString(svg()(model), 'image/svg+xml').documentElement
        expect(element.outerHTML.replace(/ xmlns="[^"]*"/, '')).toBe(parsed.outerHTML.replace(/ xmlns="[^"]*"/, ''))
    })

    it('omits the background rect when background is null', () => {
        const element = dom(document.createElement('div'))({ ...model, background: null })
        expect(element.querySelectorAll('rect')).toHaveLength(2)
    })

    it('keeps a malicious color as a plain attribute value', () => {
        const color = '"/><script>alert(1)</script>'
        const element = dom(document.createElement('div'))({ ...model, color })
        expect(element.querySelector('script')).toBeNull()
        expect(element.querySelector('g')!.getAttribute('fill')).toBe(color)
    })

    it('works end to end through render()', () => {
        const element = render('1234', dom(document.body), { quietZone: 10 })
        expect(document.body.contains(element)).toBe(true)
        expect(element.getAttribute('width')).toBe(String((57 + 20) * 2))
    })
})
