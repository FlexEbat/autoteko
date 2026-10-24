import { defineConfig } from 'vitest/config'

// Tests that need no database, so mutation runs are fast and isolated.
export default defineConfig({
  test: {
    include: [
      'packages/shared/tests/**/*.test.ts',
      'apps/web/tests/safe-redirect.test.ts',
      'apps/web/tests/commit-msg.test.ts',
    ],
  },
})
