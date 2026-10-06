import ELEMENT_TABLE, { type ElementRow } from './element-table'

// Environment-agnostic Code128 core. Must not reference `document`, `window`
// or any platform API: renderers (svg, canvas, dom, react-native) live in
// their own entry points and consume the BarcodeModel produced here.

export interface Encoded {
    input: string
    /** Symbol values: start, data, checksum, stop. */
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

const START_A = 103
const START_B = 104
const START_C = 105
const CODE_A = 101
const STOP = 106

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

// Find the row whose `column` equals `key`; `index` is the input position
// reported in the error when the key has no symbol in that code set.
function lookup(column: 1 | 2 | 3, key: string, index: number): ElementRow {
    const row = ELEMENT_TABLE.find(o => o[column] === key)
    if (!row) throw new Error(`Unsupported character ${JSON.stringify(key)} at index ${index}`)
    return row
}

export function encode(input: string): Encoded {
    if (!input) throw new Error('Input Required')

    let start: number
    let elements: ElementRow[] = []

    const chars = input.split('')
    if (/^[0-9]{1}$/.test(input)) {
        start = START_A
        elements = chars.map((c, i) => lookup(1, c, i))
    } else if (/^[0-9]+$/.test(input)) {
        start = START_C
        const pairs = chars.length - (chars.length % 2)
        for (let i = 0; i < pairs; i += 2) {
            elements.push(lookup(3, `${chars[i]}${chars[i + 1]}`, i))
        }
        if (chars.length % 2 === 1) {
            elements.push(symbol(CODE_A))
            elements.push(lookup(1, chars[pairs]!, pairs))
        }
    } else if (/^[A-Z0-9]+$/.test(input)) {
        start = START_A
        elements = chars.map((c, i) => lookup(1, c, i))
    } else {
        start = START_B
        elements = chars.map((c, i) => lookup(2, c, i))
    }

    const checksum = elements.reduce((sum, row, i) => sum + row[0] * (i + 1), start)

    const rows = [symbol(start), ...elements, symbol(checksum % 103), symbol(STOP)]
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
