# 06 React Native: Barcode + views()

Status: ready-for-agent
Blocked by: 03

Part of `.scratch/ts-functional-core/spec.md`.

## What

`src/react-native.tsx` exports:

- `views({ style }?): Renderer<React.ReactElement>`: an outer `View` (size plus background) containing absolutely positioned `View`s, one per bar. This is the 1.x structure.
- `<Barcode value unitWidth height color background quietZone style />`: `useMemo(() => encode(value), [value])`, then `layout` and `views`. Defaults come from `layout` (`unitWidth` is now 2 everywhere).
- `react` and `react-native` are external and remain optional peer dependencies.

## Acceptance

- Tests mock `react-native` (`View` as a host component) and render with react-test-renderer. They check the outer size, the bar count and positions, the quietZone offset, and that `style` is merged.

## Comments

**Done.** `src/react-native.tsx` exports `views({ style })`, `<Barcode>` and the `ViewsOptions` and `BarcodeProps` types. `test/react-native.test.tsx` has 6 tests, and the suite total is 43. Typecheck and build are green.

Notes:
- `BarcodeProps extends LayoutOptions` adds `value` and `style`. `encode` is memoised on `value`, and the other props go straight to `layout` (unset props fall back to the defaults, so `unitWidth` is now 2 as everywhere else).
- `background: null` maps to `backgroundColor: 'transparent'`.
- Dev dependencies: `react`, `@types/react`, `react-test-renderer` (+ types), and `react-native`, which is used for types only. Tests `vi.mock('react-native')` with a `View` host stand-in, because the real package is Flow source. react-test-renderer is deprecated in React 19, and its warning is silenced in the test.
- `tsup.config.ts` now sets `splitting: true`. Previously the CJS builds each inlined their own copy of the core and svg-tree (`react-native.cjs` was 10 KB); now they share chunks, as ESM already did. All CJS and ESM entries were smoke-tested from `dist/`.
