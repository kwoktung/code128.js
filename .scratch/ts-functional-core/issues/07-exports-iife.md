# 07 package.json exports + IIFE global bundle

Status: ready-for-agent
Blocked by: 04, 05, 06

Part of `.scratch/ts-functional-core/spec.md`.

## What

- `exports` declares `.`, `./svg`, `./canvas`, `./dom` and `./react-native`, each with `types`, `import` (`.mjs`) and `require` (`.cjs`). `main`/`module`/`types` are kept as fallbacks for `.`. Remove the `"react-native"` field.
- Add an IIFE build `dist/code128.global.js` with the global name `Code128`, exposing `{ encode, layout, render, svg, canvas, dom }` (no React Native).
- Set `version` to `2.0.0` and add a `files` whitelist (`dist`).

## Acceptance

- A smoke test (vitest or script) `require`s and `import`s each subpath from `dist/` and calls `render('1234', svg())`.
- A test loads the IIFE in a `vm` context with a fake `window` and checks that `window.Code128.render` works.
- `pnpm pack --dry-run` lists only the intended files.

## Comments

**Done.** The package is at `2.0.0`, with an `exports` map for `.`, `./svg`, `./canvas`, `./dom`, `./react-native` and `./package.json` (each with `import`/`require` and their own `types`). `main`/`module`/`types` remain as fallbacks, the `"react-native"` field is gone, and `files: ["dist"]` and `sideEffects: false` are set. `unpkg`/`jsdelivr` point at the IIFE bundle so CDN `<script>` URLs work without a path.

- IIFE: `src/global.ts` → `dist/code128.global.js` (globalName `Code128`, 11.5 KB unminified) exposes `encode`, `layout`, `render`, `svg`, `canvas` and `dom`.
- `test/package.test.ts` builds, then resolves each subpath through Node's real `exports` resolution (package self-reference, in a child process) via both `require` and `import`, plus `react-native` with a stubbed RN. It also runs the IIFE in a `vm` context. 47 tests pass.
- `pnpm pack --dry-run` contains only `dist/**`, `package.json` and `README.md`.
- `@arethetypeswrong/cli --profile node16` is green for every subpath under node16 CJS/ESM and bundler. node10 can't resolve subpaths (it has no `exports` support); this is accepted given `engines.node >= 18`.

Build and typecheck changes:
- `dist/` is now cleared in the `build` script instead of tsup's `clean`, because the ESM/CJS and IIFE configs build in parallel and would delete each other's output.
- Typecheck is split. The root `tsconfig.json` covers `src` only, with `types: []` so the core can't silently use Node APIs (verified with a canary `process` reference). `test/tsconfig.json` adds `@types/node`. `pnpm typecheck` runs both.
