import { describe, expect, it } from 'vitest'
import { encode } from '../src/index'
import ELEMENT_TABLE from '../src/element-table'
import { decode, symbols } from './decode'
import golden from './fixtures/golden.json'

// Symbol count excluding start, checksum and stop: what code-set choice controls.
const dataSymbols = (input: string) => encode(input).codes.length - 3

// Seeded PRNG so failures reproduce.
function random(seed: number) {
    return () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        return seed / 0x80000000
    }
}

describe('decoder (test helper)', () => {
    it.each(golden)('decodes the 1.x encoding of $input', ({ input, bits }) => {
        expect(decode(bits)).toBe(input)
    })
})

describe('encode round-trips', () => {
    it.each(golden)('$input', ({ input }) => {
        expect(decode(encode(input).bits)).toBe(input)
    })

    it('every printable ASCII pair', () => {
        for (let a = 32; a <= 126; a++) {
            for (let b = 32; b <= 126; b++) {
                const input = String.fromCharCode(a, b)
                expect(decode(encode(input).bits), JSON.stringify(input)).toBe(input)
            }
        }
    })

    it('random strings mixing digit runs and text', () => {
        const next = random(42)
        const pick = (chars: string) => chars[Math.floor(next() * chars.length)]!
        for (let n = 0; n < 2000; n++) {
            let input = ''
            const parts = 1 + Math.floor(next() * 5)
            for (let p = 0; p < parts; p++) {
                const len = 1 + Math.floor(next() * 9)
                const alphabet = next() < 0.5 ? '0123456789' : 'ABCxyz-_ {}~'
                for (let i = 0; i < len; i++) input += pick(alphabet)
            }
            expect(decode(encode(input).bits), JSON.stringify(input)).toBe(input)
        }
    })
})

describe('shortest encoding', () => {
    it.each(golden)('$input is never longer than 1.x', ({ input, bits }) => {
        expect(encode(input).bits.length).toBeLessThanOrEqual(bits.length)
    })

    it.each([
        ['ABC123456', 112],
        ['SN20261006123456', 145],
        ['1234', 57],
        ['abc1234', 101] // a 4-digit run at the end pays off
    ])('%s takes %i modules', (input, modules) => {
        expect(encode(input).bits.length).toBe(modules)
    })

    it('stays in Code B for digit runs too short to pay off', () => {
        // 4 digits in the middle: CODEC + 2 pairs + CODEB = 4 symbols, no gain.
        expect(encode('ab1234cd').codes[0]).toBe(104)
        expect(encode('ab1234cd').codes).not.toContain(99)
    })

    it('prefers Code B over Code A when equally short', () => {
        expect(encode('CODE128').codes[0]).toBe(104)
        expect(encode('7').codes[0]).toBe(104)
    })

    // Exhaustive search over every valid symbol sequence (no memoisation),
    // as an independent check that the encoder finds the minimum.
    function shortest(input: string): number {
        const inA = (c: string) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 95
        const inB = (c: string) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126
        const digits = (s: string) => /^[0-9]{2}$/.test(s)
        const go = (i: number, set: string, justSwitched: boolean): number => {
            if (i === input.length) return 0
            let best = Infinity
            if (set === 'C' && digits(input.slice(i, i + 2))) best = Math.min(best, 1 + go(i + 2, set, false))
            if (set === 'A' && inA(input[i]!)) best = Math.min(best, 1 + go(i + 1, set, false))
            if (set === 'B' && inB(input[i]!)) best = Math.min(best, 1 + go(i + 1, set, false))
            if (!justSwitched) {
                for (const other of ['A', 'B', 'C']) {
                    if (other !== set) best = Math.min(best, 1 + go(i, other, true))
                }
            }
            return best
        }
        return Math.min(go(0, 'A', true), go(0, 'B', true), go(0, 'C', true))
    }

    it('matches an exhaustive search on every string up to length 7 over "0", "1", "a", "A"', () => {
        const alphabet = ['0', '1', 'a', 'A']
        let inputs = ['']
        for (let len = 1; len <= 7; len++) {
            inputs = inputs.flatMap(prefix => alphabet.map(c => prefix + c))
            for (const input of inputs) {
                expect(dataSymbols(input), input).toBe(shortest(input))
            }
        }
    })
})

describe('regression baseline', () => {
    it('symbol values for the golden inputs', () => {
        expect(Object.fromEntries(golden.map(({ input }) => [input, encode(input).codes]))).toMatchSnapshot()
    })

    it('only ever emits valid table patterns', () => {
        const patterns = new Set(ELEMENT_TABLE.map(row => row[5]))
        for (const { input } of golden) {
            const { bits, codes } = encode(input)
            expect(symbols(bits)).toEqual(codes)
            for (const code of codes) expect(patterns.has(ELEMENT_TABLE[code]![5])).toBe(true)
        }
    })
})
