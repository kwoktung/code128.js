import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'

// Type-checks every ```ts / ```tsx block in README.md against the built
// package (dist/, built by test/global-setup.ts), importing it by name so
// resolution goes through the `exports` map like a real consumer.
//
// React Native's global types conflict with the DOM lib, so — like real
// projects — RN examples are checked in their own program without DOM.

const root = resolve(__dirname, '..')
const dir = resolve(__dirname, '.readme')

const STUBS = `declare module 'react-native-svg' {
    export const SvgXml: import('react').ComponentType<{ xml: string }>
}
`

function typecheck(name: string, lib: string[], files: string[], skipLibCheck = false): string {
    const project = resolve(dir, `tsconfig.${name}.json`)
    writeFileSync(project, JSON.stringify({
        compilerOptions: {
            target: 'ES2018',
            lib,
            module: 'ESNext',
            moduleResolution: 'bundler',
            jsx: 'react',
            strict: true,
            esModuleInterop: true,
            isolatedModules: true,
            noEmit: true,
            skipLibCheck,
            types: []
        },
        // Explicit list: `include` globs skip dot-directories like this one.
        files
    }))
    try {
        execFileSync(resolve(root, 'node_modules/.bin/tsc'), ['-p', project], { encoding: 'utf8' })
        return ''
    } catch (error) {
        return (error as { stdout: string }).stdout
    }
}

it('README code blocks type-check against the published types', () => {
    const readme = readFileSync(resolve(root, 'README.md'), 'utf8')
    const blocks = [...readme.matchAll(/```(tsx?)\n([\s\S]*?)```/g)]
    expect(blocks.length).toBeGreaterThan(0)

    rmSync(dir, { recursive: true, force: true })
    mkdirSync(dir)
    writeFileSync(resolve(dir, 'stubs.d.ts'), STUBS)

    const web: string[] = []
    const native: string[] = ['stubs.d.ts']
    blocks.forEach(([, lang, code], i) => {
        const file = `block-${i}.${lang}`
        writeFileSync(resolve(dir, file), code!)
        ;(/from 'react-native/.test(code!) || /code128\.js\/react-native/.test(code!) ? native : web).push(file)
    })
    expect(native.length).toBeGreaterThan(1)

    expect(typecheck('web', ['ES2018', 'DOM'], web)).toBe('')
    // React Native's own .d.ts files don't pass strict checks; RN's default
    // tsconfig (@react-native/typescript-config) also skips lib checks.
    expect(typecheck('native', ['ES2018'], native, true)).toBe('')
})
