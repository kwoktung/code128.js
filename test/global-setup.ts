import { execSync } from 'node:child_process'
import { resolve } from 'node:path'

export default function setup() {
    execSync('pnpm build', { cwd: resolve(__dirname, '..'), stdio: 'ignore' })
}
