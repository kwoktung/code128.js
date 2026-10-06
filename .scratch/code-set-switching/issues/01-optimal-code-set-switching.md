# 01 Optimal code-set switching and Code A/B selection

Status: needs-triage

## Problem

The encoder picks a single code set (A, B or C) for the whole input and never switches:

1. Mixed inputs like `ABC123456` stay in one set, so the symbol is longer than necessary. Switching to Code C for runs of 4 or more digits would shorten it.
2. `/^[A-Z0-9]+$/` selects Code A, although Code B covers the same characters. Code A is only needed for control characters (ASCII 0–31), which the encoder doesn't support at all today.
3. The odd-length numeric case already does one ad-hoc switch (C → B via `ELEMENT_TABLE[101]`). A general algorithm would subsume it.

## Notes

- This changes `encode` output, so it was deliberately kept out of the TS rewrite (`.scratch/ts-functional-core/`), whose golden fixture requires 1.x bit-for-bit parity. Do this after that work lands, then regenerate the fixture intentionally.
- Consider whether a smaller barcode with the same scannability is a semver-minor or a major change for users who snapshot output.
