# 01 Code B table maps `{` and `}` to the wrong characters

Status: needs-triage

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
