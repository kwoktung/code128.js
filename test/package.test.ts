import { execFileSync, execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import vm from 'node:vm'
import { beforeAll, describe, expect, it } from 'vitest'
import { encode, render } from '../src/index'
import { svg } from '../src/svg'

// These tests exercise the built package in dist/ through Node's real
// `exports` resolution (self-reference by package name), not vitest's.

const root = resolve(__dirname, '..')
const SUBPATHS = ['code128.js', 'code128.js/svg', 'code128.js/canvas', 'code128.js/dom']

function node(args: string[], code: string): string {
    return execFileSync(process.execPath, [...args, '-e', code], { cwd: root, encoding: 'utf8' }).trim()
}

beforeAll(() => {
    execSync('pnpm build', { cwd: root, stdio: 'ignore' })
}, 60_000)

describe('package exports', () => {
    const expected = render('1234', svg())

    it('resolves every subpath through require()', () => {
        const out = node([], `
            const mods = ${JSON.stringify(SUBPATHS)}.map(p => require(p));
            const [{ render }, { svg }, { canvas }, { dom }] = mods;
            if (typeof canvas !== 'function' || typeof dom !== 'function') throw new Error('missing export');
            process.stdout.write(render('1234', svg()));
        `)
        expect(out).toBe(expected)
    })

    it('resolves every subpath through import', () => {
        const out = node(['--input-type=module'], `
            const [{ render }, { svg }, { canvas }, { dom }] = await Promise.all(${JSON.stringify(SUBPATHS)}.map(p => import(p)));
            if (typeof canvas !== 'function' || typeof dom !== 'function') throw new Error('missing export');
            process.stdout.write(render('1234', svg()));
        `)
        expect(out).toBe(expected)
    })

    it('resolves the react-native subpath (with react-native stubbed)', () => {
        const out = node([], `
            const Module = require('module');
            const load = Module._load;
            Module._load = function (request, ...rest) {
                return request === 'react-native' ? { View: 'View' } : load.call(this, request, ...rest);
            };
            const { render } = require('code128.js');
            const { views, Barcode } = require('code128.js/react-native');
            if (typeof Barcode !== 'function') throw new Error('missing Barcode');
            process.stdout.write(String(render('1234', views()).props.children.length));
        `)
        expect(Number(out)).toBe(encode('1234').bits.match(/1+/g)!.length)
    })
})

describe('IIFE bundle', () => {
    it('exposes window.Code128 for <script> users', () => {
        const window: Record<string, any> = {}
        const context = vm.createContext(window)
        vm.runInContext(readFileSync(resolve(root, 'dist/code128.global.js'), 'utf8'), context)

        const { Code128 } = window
        expect(Object.keys(Code128).sort()).toEqual(['canvas', 'dom', 'encode', 'layout', 'render', 'svg'])
        expect(Code128.render('1234', Code128.svg())).toBe(render('1234', svg()))
    })
})
