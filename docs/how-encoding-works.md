# How encoding works

This page explains the structure of a Code128 barcode and how code128.js turns a string into one: it picks code sets, produces symbol values, expands them into modules, and lays the modules out as bars.

```
"ABC123456"
   │ encode: pick code sets with dynamic programming
   ▼
[104, 33, 34, 35, 99, 12, 34, 56, 23, 106]     ← codes
   │ look up each value's module bits and concatenate
   ▼
"1101001000010100011000…1100011101011"          ← bits (112 modules)
   │ layout: merge runs of 1s, scale by unitWidth, add quiet zone
   ▼
[{x:0,width:4}, {x:6,width:2}, …]               ← bars
   │ renderer
   ▼
SVG / Canvas / React Native view
```

## 1. Symbols

A Code128 barcode is a sequence of **symbols**. Every symbol is exactly **11 modules** wide (a module is the narrowest bar or space) and is made of 3 bars and 3 spaces. The spec defines **107 symbols, valued 0–106**. They are listed in `src/element-table.ts`:

```
[value, Code A char, Code B char, Code C pair, widths, module bits]
[33,    "A",         "A",         "33",        "111323", "10100011000"]
```

A complete barcode is laid out like this:

```
[start] [data symbols …] [checksum] [stop]
  11        11 × n           11       13   (the stop symbol is 2 modules longer)
```

So **the width of a barcode depends only on how many symbols it has**. Fewer symbols means a narrower barcode.

## 2. Code sets A, B and C

**The same symbol value means different things depending on the current code set:**

| Code set | What it can encode | Characters per symbol |
|---|---|---|
| **Code A** | ASCII 32–95 (uppercase, digits, punctuation) and control characters 0–31 (NUL, TAB, CR, …) | 1 |
| **Code B** | ASCII 32–127 (uppercase, **lowercase**, digits, punctuation) | 1 |
| **Code C** | Digit pairs `00`–`99` | **2** |

For example:

- Symbol **33** is `'A'` in Code A and Code B, and `"33"` in Code C.
- Symbol **65** is the control character SOH in Code A, `'a'` in Code B, and `"65"` in Code C.

A decoder must track the current code set to turn symbols back into text.

## 3. Switching code sets

The spec defines code-set switching through a few special symbols.

The **start symbol** sets the initial code set:

| Symbol | Meaning |
|---|---|
| 103 | START A |
| 104 | START B |
| 105 | START C |

A **switch symbol** inside the data changes the code set from that point onward:

| Symbol | Meaning |
|---|---|
| 99 | CODE C (switch to C) |
| 100 | CODE B (switch to B) |
| 101 | CODE A (switch to A) |
| 98 | SHIFT (switches between A and B for the next character only; not used by this library) |

Symbols 100 and 101 mean different things in different sets. In Code A, for example, 101 is FNC4 rather than CODE A, because a switch to the set you are already in is never needed. Each switch symbol is therefore only valid from **the other two sets**.

The **checksum** is the start value plus the sum of each data symbol's value times its position (starting at 1), modulo 103. **Switch symbols count as data symbols** and are included in the checksum.

Here is `ABC123456`:

```
104      33  34  35   99      12  34  56   23         106
START B  A   B   C    CODE C  12  34  56   checksum   STOP
```

Once a scanner reads symbol 99, it reads 12, 34 and 56 as digit pairs. The checksum works out as follows:

```
104 + 33×1 + 34×2 + 35×3 + 99×4 + 12×5 + 34×6 + 56×7
= 104 + 33 + 68 + 105 + 396 + 60 + 204 + 392 = 1362
1362 mod 103 = 23
```

## 4. Picking code sets: when a switch pays off

The costs are:

- Code A or B: 1 symbol per character
- Code C: 1 symbol per 2 digits
- Each switch: 1 extra symbol

**A run of n digits in the middle** of the input (`…X digits Y…`) needs two switches, one into C and one back out:

- Staying in B costs n symbols.
- Switching to C costs n/2 + 2 symbols.
- n/2 + 2 < n holds when **n ≥ 6** (at n = 4 the two options cost the same).

**A run of digits at the start or end** needs only one switch, because a barcode can begin with START C at no extra cost:

- n/2 + 1 < n holds when **n ≥ 4**.

### Dynamic programming

Whether a switch pays off depends on where a digit run sits and how long it is, so fixed rules don't cover every case. Instead, `encode` finds the shortest symbol sequence with dynamic programming (`shortestSymbols` in `src/index.ts`):

- **State:** (position i, current code set).
- **cost[i][set]:** the fewest symbols needed to encode the rest of the input from that state.
- **Transitions:**
  - Consume in the current set (1 character in A or B, 2 digits in C) for a cost of 1.
  - Or switch to another set and then consume, for a cost of 2. Two switches in a row never help, so only one switch is considered.
- The table is **filled from the end backwards**. The encoder then picks the cheapest starting set, since the start symbol carries no switch cost.
- **Ties** are broken in this order: stay in the current set, then B, then C, then A.

The supported input is printable ASCII (32–126). Control characters (ASCII 0–31, which need Code A or SHIFT) and GS1-128 (FNC1) are not supported, so Code A is only chosen on a tie when nothing else is available.

### Comparison with 1.x

1.x picked a single code set for the whole string with regular expressions and never switched:

```js
if (/^[0-9]{1}$/.test(input))        → Code A        // single digit
else if (/^[0-9]+$/.test(input))     → Code C        // digits only
    for odd lengths: CODE A (101) before the last digit, then encode it in A
else if (/^[A-Z0-9]+$/.test(input))  → Code A        // uppercase and digits
else                                 → Code B        // everything else
```

This had three problems:

- Mixed input never switched to Code C.
- `[A-Z0-9]` picked Code A for no gain, since Code B covers the same characters.
- The odd-length switch was a hand-written special case.

Dynamic programming in 2.0 handles all three cases with one algorithm:

| Input | 1.x | 2.0 |
|---|---|---|
| `ABC123456` | A: START A + 9 characters → **134** modules | B: `ABC` + CODE C + `12 34 56` → **112** modules |
| `SN20261006123456` | All B, **211** modules | `SN` + CODE C + 7 digit pairs → **145** modules |
| `123` | START C, `12`, CODE A, `3` | START B, `1`, `2`, `3` (same length) |
| `7`, `CODE128` | START A | START B (same length) |

The scanned content is the same, and no barcode is wider than in 1.x.

## 5. Symbols to modules

Once the symbol values are known, turning them into bits is a table lookup. Column 5 of each row in `element-table.ts` is a **widths string**. Its 6 digits alternate **bar, space, bar, space, bar, space**, and each digit is a width in modules. Bars become `1` and spaces become `0`:

```
widths:  2    1    1    2    1    4
kind:    bar  spc  bar  spc  bar  spc
modules: 11   0    1    00   1    0000
                  ↓
bits:    11010010000   (2+1+1+2+1+4 = 11)
```

Column 6 holds this expanded form, and the encoder uses it directly. The stop symbol has 7 elements (bar, space, bar, space, bar, space, bar), for 13 modules in total:

```
2331112 → 11 000 111 0 1 0 11 → 1100011101011
```

Here is `ABC123456` expanded in full:

| Value | Meaning | Widths | Module bits |
|---|---|---|---|
| 104 | START B | 211214 | `11010010000` |
| 33 | `A` | 111323 | `10100011000` |
| 34 | `B` | 131123 | `10001011000` |
| 35 | `C` | 131321 | `10001000110` |
| 99 | CODE C | 113141 | `10111011110` |
| 12 | `12` | 112232 | `10110011100` |
| 34 | `34` | 131123 | `10001011000` |
| 56 | `56` | 331121 | `11100010110` |
| 23 | checksum | 312131 | `11101101110` |
| 106 | STOP | 2331112 | `1100011101011` |

Concatenated in order, these give `encoded.bits`, which is 9 × 11 + 13 = **112** modules long:

```ts
bits: rows.map(row => row[5]).join('')
```

`B` and `34` are the same symbol with the same bits. The barcode itself doesn't tell them apart. The decoder interprets the symbol according to the current code set.

## 6. Modules to bars

`layout()` merges **each run of consecutive `1`s into one bar**:

```
bits:  1 1 0 1 0 0 1 0 0 0 0 …
       └┬┘   ┬     ┬
       bar1  bar2  bar3  …
       x=0   x=3   x=6
       w=2   w=1   w=1
```

Each bar's position and width are multiplied by `unitWidth` (2 pixels by default), and `quietZone` adds blank margin on both sides. The result is `bars: {x, width}[]`. The SVG, Canvas and React Native renderers only draw these rectangles (see [ADR 0001](adr/0001-renderer-as-pure-function.md)).
