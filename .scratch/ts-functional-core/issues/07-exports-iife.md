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
