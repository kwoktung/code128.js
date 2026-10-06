import ELEMENT_TABLE from '../src/element-table'

// Test-only Code128 decoder: bits → symbol values → text. Independent of the
// encoder, so round-tripping proves an encoding is valid, not just stable.

const BY_PATTERN = new Map(ELEMENT_TABLE.map(row => [row[5], row[0]]))
type CodeSet = 'A' | 'B' | 'C'
// Switch symbols mean different things per set (e.g. 101 is FNC4 in Code A).
const SWITCH: Record<CodeSet, Record<number, CodeSet>> = {
    A: { 99: 'C', 100: 'B' },
    B: { 99: 'C', 101: 'A' },
    C: { 100: 'B', 101: 'A' }
}
const START: Record<number, CodeSet> = { 103: 'A', 104: 'B', 105: 'C' }

export function symbols(bits: string): number[] {
    if (!bits.endsWith(ELEMENT_TABLE[106]![5])) throw new Error('missing stop pattern')
    const body = bits.slice(0, -13)
    if (body.length % 11 !== 0) throw new Error(`bad length ${bits.length}`)
    const values: number[] = []
    for (let i = 0; i < body.length; i += 11) {
        const value = BY_PATTERN.get(body.slice(i, i + 11))
        if (value === undefined) throw new Error(`unknown pattern at module ${i}`)
        values.push(value)
    }
    return [...values, 106]
}

export function decode(bits: string): string {
    const values = symbols(bits)
    const [start, ...rest] = values
    const data = rest.slice(0, -2)
    const checksum = rest[rest.length - 2]!

    const expected = data.reduce((sum, v, i) => sum + v * (i + 1), start!) % 103
    if (checksum !== expected) throw new Error(`checksum ${checksum} != ${expected}`)

    const first = START[start!]
    if (!first) throw new Error(`bad start ${start}`)
    let set: CodeSet = first
    let text = ''
    for (const v of data) {
        const next: CodeSet | undefined = SWITCH[set][v]
        if (next) {
            set = next
        } else if (set === 'C') {
            if (v > 99) throw new Error(`unsupported Code C value ${v}`)
            text += String(v).padStart(2, '0')
        } else {
            const ch = ELEMENT_TABLE[v]![set === 'A' ? 1 : 2]
            if (ch.length !== 1) throw new Error(`unsupported ${ch} in Code ${set}`)
            text += ch
        }
    }
    return text
}
