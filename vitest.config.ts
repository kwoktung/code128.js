import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        // Builds dist/ once for the tests that exercise the published package.
        globalSetup: './test/global-setup.ts'
    }
})
