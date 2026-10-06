import { defineConfig } from 'tsup'

export default defineConfig({
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
    clean: true,
    target: 'es2018',
    external: ['react', 'react-native']
})
