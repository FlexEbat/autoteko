import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 20_000,
    coverage: {
      provider: 'v8',
      include: ['packages/shared/src/**/*.ts', 'apps/web/src/server/**/*.ts', 'scripts/*.ts'],
      exclude: ['**/types.ts'],
      thresholds: {
        // Pure modules: every line, branch and function is exercised (tech.md, section 9).
        'packages/shared/src/**': { lines: 100, branches: 100, functions: 100, statements: 100 },
        'apps/web/src/server/security/safe-redirect.ts': {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100,
        },
        // The rest of the code: at least 90 percent.
        'apps/web/src/server/data/**': { lines: 90, branches: 90, functions: 90, statements: 90 },
        'scripts/**': { lines: 90, branches: 90, functions: 90, statements: 90 },
      },
    },
    projects: [
      { test: { name: 'shared', include: ['packages/shared/tests/**/*.test.ts'] } },
      {
        test: {
          name: 'web',
          include: ['apps/web/tests/**/*.test.ts'],
          globalSetup: ['apps/web/tests/helpers/global-setup.ts'],
        },
      },
    ],
  },
})
