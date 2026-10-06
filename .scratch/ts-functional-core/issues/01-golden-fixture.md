# 01 Golden fixture of 1.x encoder output

Status: ready-for-agent
Blocked by: none

Part of `.scratch/ts-functional-core/spec.md`.

## What

Before touching any source, capture the current encoder's output as a regression baseline.

- Build the current code (`pnpm build`) and load `dist/core.js`.
- For each input below, record `{ input, bits }` (from `new Core(input).bits`) into `test/fixtures/golden.json`. Commit the generator script too (e.g. `scripts/gen-golden.cjs`), but it must run against the **1.x** build only.
- Inputs should cover every encoder branch:
  - a single digit: `"7"`
  - an even number of digits: `"1234"`, `"00"`, `"123456789012"`
  - an odd number of digits: `"123"`, `"12345"`
  - uppercase letters and digits (Code A path): `"CODE128"`, `"ABC123456"`
  - mixed case and symbols (Code B path): `"hello"`, `"Code128.js"`, `"a b-c_d!"`, `"~{}|"`
  - a long string of about 40 characters

## Acceptance

- `test/fixtures/golden.json` exists with all of the inputs above.
- The fixture is committed before ticket 03 changes `encode`.
