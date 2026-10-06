import { defineConfig } from 'tsup'

// `dist/` is cleared by the build script rather than `clean`, because the two
// configs build in parallel and would otherwise delete each other's output.
export default defineConfig([
    {
        entry: {
            index: 'src/index.ts',
            svg: 'src/svg.ts',
            canvas: 'src/canvas.ts',
            dom: 'src/dom.ts',
            'react-native': 'src/react-native.tsx'
        },
        format: ['esm', 'cjs'],
        outExtension: ({ format }) => ({ js: format === 'cjs' ? '.cjs' : '.mjs' }),
        // tsup injects `baseUrl` into its dts build, which TypeScript 6 deprecates.
        dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
        // Share the core between entries in CJS too (ESM splits by default).
        splitting: true,
        target: 'es2018',
        external: ['react', 'react-native']
    },
    {
        // <script> build: `window.Code128 = { encode, layout, render, svg, canvas, dom }`
        entry: { 'code128.global': 'src/global.ts' },
        format: ['iife'],
        globalName: 'Code128',
        outExtension: () => ({ js: '.js' }),
        target: 'es2018'
    }
])
