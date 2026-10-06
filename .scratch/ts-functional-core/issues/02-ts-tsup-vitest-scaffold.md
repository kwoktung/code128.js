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
