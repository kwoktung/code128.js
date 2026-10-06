import { describe, expect, it } from 'vitest'
import ELEMENT_TABLE from '../src/element-table'

describe('ELEMENT_TABLE', () => {
    it('has one row per symbol value 0..106', () => {
        expect(ELEMENT_TABLE).toHaveLength(107)
        ELEMENT_TABLE.forEach((row, i) => expect(row[0]).toBe(i))
    })

    it('has 11-module patterns, except the 13-module stop symbol', () => {
        ELEMENT_TABLE.forEach(([value, , , , widths, bits]) => {
            const modules = value === 106 ? 13 : 11
            expect(bits).toMatch(new RegExp(`^[01]{${modules}}$`))
            const sum = widths.split('').reduce((acc, w) => acc + Number(w), 0)
            expect(sum).toBe(modules)
        })
    })
})
