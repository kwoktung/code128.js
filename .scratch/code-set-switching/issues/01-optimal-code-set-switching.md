# 01 Optimal code-set switching and Code A/B selection

Status: resolved

## Problem

The encoder picks a single code set (A, B or C) for the whole input and never switches:

1. Mixed inputs like `ABC123456` stay in one set, so the symbol is longer than necessary. Switching to Code C for runs of 4 or more digits would shorten it.
2. `/^[A-Z0-9]+$/` selects Code A, although Code B covers the same characters. Code A is only needed for control characters (ASCII 0–31), which the encoder doesn't support at all today.
3. The odd-length numeric case already does one ad-hoc switch (C → B via `ELEMENT_TABLE[101]`). A general algorithm would subsume it.

## Notes

- This changes `encode` output, so it was deliberately kept out of the TS rewrite (`.scratch/ts-functional-core/`), whose golden fixture requires 1.x bit-for-bit parity. Do this after that work lands, then regenerate the fixture intentionally.
- Consider whether a smaller barcode with the same scannability is a semver-minor or a major change for users who snapshot output.

## Plan

Decided after PR #7 merged. The change ships in **2.0.0**, before it is published, so the output change rides the major bump. It is kept out of #7 so that the refactor's golden-parity proof stays clean.

**Why it shortens.** Every symbol is 11 modules wide. Code A and Code B hold 1 character per symbol, while Code C holds 2 digits per symbol. A switch (`CODEA` 101, `CODEB` 100, `CODEC` 99) costs 1 symbol. Code C therefore pays off for a run of ≥ 4 digits at the start or end, or ≥ 6 digits in the middle. For example, `SN20261006123456` goes from 211 to 145 modules.

**Algorithm.** Dynamic programming over `(position, current set)`, minimising the symbol count:
- From each state you can either consume in the current set (1 char in A/B, or a digit pair in C) or switch once and then consume. Two switches in a row never help.
- The start symbol has no switch cost, so pick the cheapest starting set.
- Ties prefer, in order: staying in the current set, then **B**, then C, then A. This means `[A-Z0-9]` input no longer picks Code A for no gain (point 2), and the ad-hoc odd-digit rule (point 3) is subsumed.
- Supported input stays printable ASCII (32–126). Unsupported characters still throw `Unsupported character … at index N`.

**Tests.** These replace "bits equal 1.x":
- A decoder in the tests (bits → symbols → text, verifying the checksum and stop) round-trips the golden inputs, every printable pair, and seeded random mixed strings.
- Optimality: compare against an exhaustive search on small alphabets.
- Never longer than 1.x for every golden input, with exact lengths for `ABC123456` (112) and `SN20261006123456` (145).
- A vitest snapshot of `codes` for the golden inputs, as the new regression baseline (updated intentionally with `-u`).
- `test/fixtures/golden.json` stays as the 1.x baseline for the "never longer" and round-trip checks.

**Docs.** In `docs/1.x.md`, "encoded output is unchanged" becomes "same content when scanned, usually narrower". The README notes automatic code-set switching and that `codes` include switch symbols.

**Out of scope.** Control characters (ASCII 0–31, via Code A/SHIFT) and GS1-128 (FNC1).

## Comments

**Done** on branch `code-set-switching`. `encode` now picks the shortest symbol sequence with a DP over (position, code set) (`shortestSymbols` in `src/index.ts`). Code A and Code B characters are read from the table, and the tie-break order is stay, then B, then C, then A.

Results against the 1.x baseline: no input got longer. `ABC123456` went from 134 to 112 modules, and `SN20261006123456` takes 145 modules (211 in all-B). `7` and `CODE128` now start in Code B, and the odd-length numbers `123` and `12345` use different but equally short encodings. Every other golden input is bit-identical.

Tests: `test/code-sets.test.ts` and the decoder in `test/decode.ts`. The decoder decodes all of the 1.x golden bits correctly, which validates it. On top of it the tests cover:
- round-trips for the golden inputs, all 9,025 printable pairs, and 2,000 seeded random mixed strings
- an exhaustive-search optimality check on all 21,844 strings of length ≤ 7 over `0`, `1`, `a`, `A`
- "never longer than 1.x" and exact lengths
- a `codes` snapshot

In `test/index.test.ts`, the 1.x bit-parity assertions were removed. The suite has 88 tests.
