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
