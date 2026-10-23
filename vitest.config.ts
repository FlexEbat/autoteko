import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 20_000,
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
