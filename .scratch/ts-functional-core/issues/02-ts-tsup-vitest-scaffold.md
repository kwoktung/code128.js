# 02 TypeScript + tsup + vitest scaffold

Status: ready-for-agent
Blocked by: 01

Part of `.scratch/ts-functional-core/spec.md`.

## What

- Add `typescript`, `tsup` and `vitest` as dev dependencies. Remove `babel-*`, `rollup*`, `jasmine`, `.babelrc`, `rollup.config.js` and `spec/`.
- `tsconfig.json`: `strict`, target ES2018, `moduleResolution: bundler`, `declaration` handled by tsup.
- `tsup.config.ts`: entries for `src/index.ts`, `src/svg.ts`, `src/canvas.ts`, `src/dom.ts` and `src/react-native.tsx`; formats `esm` and `cjs`; `dts: true`; `react`/`react-native` external. (The IIFE build is added in ticket 07.)
- Scripts: `build` → `tsup`, `test` → `vitest run`, `typecheck` → `tsc --noEmit`.
- `engines.node >= 18`.
- Convert `ELEMENT_TABLE.js` → `src/element-table.ts` with a typed tuple.

## Acceptance

- `pnpm build`, `pnpm test` (it may contain only a placeholder or the golden test) and `pnpm typecheck` all succeed.
- No babel, rollup or jasmine left in `package.json`.

## Comments

**Done** on branch `ts-rewrite`. `pnpm build`, `pnpm test` (the element-table tests) and `pnpm typecheck` all pass, and babel, rollup and jasmine are gone.

Deviations and notes:
- **TypeScript is pinned to `~6.0.3`.** TS 7 (the native port) has no JS API, so tsup's dts build (rollup-plugin-dts) crashes. TS 6 is the last JS-based release. Revisit when tsup or its replacement supports TS 7.
- `tsup.config.ts` sets `dts.compilerOptions.ignoreDeprecations: '6.0'`, because tsup injects the deprecated `baseUrl` into its dts build.
- `tsconfig.json` adds `noUncheckedIndexedAccess`, so table lookups are `T | undefined` (which feeds the explicit error in ticket 03). It also uses `jsx: "react"` (classic runtime) to keep the `react >= 16.8` peer range.
- `dist/` is no longer tracked (it is now in `.gitignore`). As a result, `scripts/gen-golden.cjs` can only be re-run by checking out a 1.x commit and building it there; the fixture itself is committed.
- The entry files (`index`, `svg`, `canvas`, `dom`, `react-native`) are `export {}` stubs until tickets 03–06.
- The `main` and `react-native` fields in `package.json` still point at the old files. Ticket 07 replaces them with `exports`.
