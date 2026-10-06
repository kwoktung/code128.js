import ELEMENT_TABLE, { type ElementRow } from './element-table'

// Environment-agnostic Code128 core. Must not reference `document`, `window`
// or any platform API: renderers (svg, canvas, dom, react-native) live in
// their own entry points and consume the BarcodeModel produced here.

export interface Encoded {
    input: string
    /** Symbol values: start, data (including code-set switches), checksum, stop. */
    codes: number[]
    /** Module string, `1` = bar, `0` = space. */
    bits: string
}

export interface LayoutOptions {
    /** Width of one module in pixels. Default `2`. */
    unitWidth?: number
    /** Bar height in pixels. Default `50`. */
    height?: number
    /** Bar color. Default `'#000'`. */
    color?: string
    /** Background color, `null` for transparent. Default `'#fff'`. */
    background?: string | null
    /** Blank modules on each side. Default `0`. */
    quietZone?: number
}

/** A run of bar modules, in pixels. */
export interface Bar {
    x: number
    width: number
}

export interface BarcodeModel {
    /** Total size in pixels, including the quiet zone. */
    width: number
    height: number
    bars: Bar[]
    color: string
    background: string | null
}

export type Renderer<R> = (model: BarcodeModel) => R

type CodeSet = 'A' | 'B' | 'C'

const START: Record<CodeSet, number> = { A: 103, B: 104, C: 105 }
// Symbol that switches *to* a set (CODEA 101, CODEB 100, CODEC 99); each one
// is valid from the two other sets.
const SWITCH_TO: Record<CodeSet, number> = { A: 101, B: 100, C: 99 }
const STOP = 106

// Tie-break order when encodings are equally short.
const PREFERENCE: CodeSet[] = ['B', 'C', 'A']

// Single-character symbols per set, read from the table: Code A covers
// ASCII 32–95, Code B covers 32–126 (multi-character entries are control
// codes and functions, which are not supported as input).
function charValues(column: 1 | 2): Map<string, number> {
    const values = new Map<string, number>()
    for (const row of ELEMENT_TABLE.slice(0, 96)) {
        if (row[column].length === 1) values.set(row[column], row[0])
    }
    return values
}
const CODE_A_VALUES = charValues(1)
const CODE_B_VALUES = charValues(2)

const DEFAULT_LAYOUT: Required<LayoutOptions> = {
    unitWidth: 2,
    height: 50,
    color: '#000',
    background: '#fff',
    quietZone: 0
}

function symbol(value: number): ElementRow {
    return ELEMENT_TABLE[value]!
}

// The data symbol for `input` at `i` in `set`, and how many characters it
// consumes; undefined when `set` can't encode what's there.
function consume(input: string, i: number, set: CodeSet): { value: number; length: number } | undefined {
    if (set === 'C') {
        const pair = input.slice(i, i + 2)
        return /^[0-9]{2}$/.test(pair) ? { value: Number(pair), length: 2 } : undefined
    }
    const value = (set === 'A' ? CODE_A_VALUES : CODE_B_VALUES).get(input[i]!)
    return value === undefined ? undefined : { value, length: 1 }
}

// Shortest symbol sequence via dynamic programming over (position, set).
// Every symbol is 11 modules, so fewest symbols = narrowest barcode. From
// each state the encoder either consumes in the current set or switches once
// and consumes (two switches in a row never help); Code C's two digits per
// symbol are what make switching worthwhile.
function shortestSymbols(input: string): { start: CodeSet; values: number[] } {
    const n = input.length
    const cost: Record<CodeSet, number>[] = []
    const next: Record<CodeSet, CodeSet>[] = []
    cost[n] = { A: 0, B: 0, C: 0 }

    const consumeCost = (i: number, set: CodeSet) => {
        const step = consume(input, i, set)
        return step ? 1 + cost[i + step.length]![set] : Infinity
    }

    for (let i = n - 1; i >= 0; i--) {
        cost[i] = { A: Infinity, B: Infinity, C: Infinity }
        next[i] = { A: 'A', B: 'B', C: 'C' }
        for (const set of PREFERENCE) {
            let best = consumeCost(i, set)
            for (const other of PREFERENCE) {
                if (other === set) continue
                const switched = 1 + consumeCost(i, other)
                if (switched < best) {
                    best = switched
                    next[i]![set] = other
                }
            }
            cost[i]![set] = best
        }
    }

    let start = PREFERENCE[0]!
    for (const set of PREFERENCE) {
        if (consumeCost(0, set) < consumeCost(0, start)) start = set
    }

    const values: number[] = []
    let set = start
    for (let i = 0; i < n; ) {
        const target = next[i]![set]
        if (target !== set) {
            values.push(SWITCH_TO[target])
            set = target
        }
        const step = consume(input, i, set)!
        values.push(step.value)
        i += step.length
    }
    return { start, values }
}

export function encode(input: string): Encoded {
    if (!input) throw new Error('Input Required')
    for (let i = 0; i < input.length; i++) {
        if (!CODE_B_VALUES.has(input[i]!)) {
            throw new Error(`Unsupported character ${JSON.stringify(input[i])} at index ${i}`)
        }
    }

    const { start, values } = shortestSymbols(input)
    const checksum = values.reduce((sum, value, i) => sum + value * (i + 1), START[start])

    const rows = [START[start], ...values, checksum % 103, STOP].map(symbol)
    return {
        input,
        codes: rows.map(row => row[0]),
        bits: rows.map(row => row[5]).join('')
    }
}

// Like object spread, but an explicit `undefined` falls back to the default
// (`null` is kept: it means a transparent background).
function withDefaults(options: LayoutOptions = {}): Required<LayoutOptions> {
    const resolved = { ...DEFAULT_LAYOUT }
    for (const key of Object.keys(resolved) as (keyof LayoutOptions)[]) {
        const value = options[key]
        if (value !== undefined) (resolved as Record<string, unknown>)[key] = value
    }
    return resolved
}

export function layout(encoded: Encoded, options?: LayoutOptions): BarcodeModel {
    const { unitWidth, height, color, background, quietZone } = withDefaults(options)
    const { bits } = encoded
    const offset = quietZone * unitWidth

    const bars: Bar[] = []
    for (let i = 0, len = bits.length; i < len; i++) {
        if (bits[i] !== '1') continue
        const x = i
        while (bits[i + 1] === '1') i++
        bars.push({ x: offset + x * unitWidth, width: (i - x + 1) * unitWidth })
    }

    return {
        width: (bits.length + 2 * quietZone) * unitWidth,
        height,
        bars,
        color,
        background
    }
}

export function render<R>(input: string, renderer: Renderer<R>, options?: LayoutOptions): R {
    return renderer(layout(encode(input), options))
}
