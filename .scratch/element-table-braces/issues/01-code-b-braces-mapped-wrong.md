# 01 Code B table maps `{` and `}` to the wrong characters

Status: resolved

## Problem

In `src/ELEMENT_TABLE.js`, the Code B column (index 2) is wrong for two values:

| Value | Table says | Should be |
| --- | --- | --- |
| 91 | `[` | `{` |
| 93 | `]` | `}` |

As a result, any input containing `{` or `}` crashes the 1.x encoder with `TypeError: Cannot read properties of undefined (reading '0')`. `[` and `]` are unaffected, because `find` matches values 59 and 61 first.

Found while generating the golden fixture (`.scratch/ts-functional-core/issues/01-golden-fixture.md`).

## Notes

- Fixing the table changes no output for any input that 1.x could encode (those inputs never reach 91 or 93 through `[`/`]`), so it does not break golden parity.
- Without a fix, the TS rewrite (ticket 03) will throw `Unsupported character "{"` for these inputs. The fix could land in ticket 03 or separately; decide during triage.

## Comments

**Fixed** on `ts-rewrite`, before the 2.0 release. `src/element-table.ts` rows 91 and 93 now hold `{` and `}` in the Code B column.

- `test/element-table.test.ts` checks that the Code A column (0–63) and the Code B column (0–94) map to consecutive printable ASCII, which would have caught this bug.
- `test/index.test.ts` encodes every printable ASCII character, and checks that `{[}]` gives `[91, 59, 93, 61]`.
- All three new tests fail without the fix, and golden parity is unchanged.
- The README now says all printable ASCII is supported and lists the fix under the 2.0 behaviour changes.
