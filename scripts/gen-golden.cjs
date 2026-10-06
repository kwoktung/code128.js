// Generates test/fixtures/golden.json from the 1.x encoder (dist/core.js).
// Run against a 1.x build only. The fixture is the 1.x baseline: the 2.x
// encoder must encode the same content and never produce a longer barcode
// (see test/code-sets.test.ts).
const fs = require('fs')
const path = require('path')
const { default: Core } = require('../dist/core')

const INPUTS = [
    // single digit
    '7',
    // even-length digits (Code C)
    '1234',
    '00',
    '123456789012',
    // odd-length digits (Code C, then CODEA for the last digit)
    '123',
    '12345',
    // uppercase + digits (Code A)
    'CODE128',
    'ABC123456',
    // mixed case / symbols (Code B)
    'hello',
    'Code128.js',
    'a b-c_d!',
    // ('{' and '}' are omitted: the 1.x table maps them wrongly and encoding crashes)
    '~|[]^`',
    // long input
    'The quick brown fox jumps over 13 lazy dogs'
]

const golden = INPUTS.map(input => ({ input, bits: new Core(input).bits }))
const out = path.join(__dirname, '..', 'test', 'fixtures', 'golden.json')
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, JSON.stringify(golden, null, 2) + '\n')
console.log(`wrote ${golden.length} entries to ${path.relative(process.cwd(), out)}`)
