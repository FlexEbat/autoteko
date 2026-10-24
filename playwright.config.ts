import { defineConfig } from '@playwright/test'

const MAIN_PORT = 3100
const EMPTY_PORT = 3101

// Two instances of the built app: the main one and one over an empty database.
export default defineConfig({
  testDir: 'apps/web/e2e',
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://127.0.0.1:${MAIN_PORT}` },
  projects: [
    { name: 'main', testIgnore: /empty\..*\.spec\.ts/, use: { baseURL: `http://127.0.0.1:${MAIN_PORT}` } },
    { name: 'empty', testMatch: /empty\..*\.spec\.ts/, use: { baseURL: `http://127.0.0.1:${EMPTY_PORT}` } },
  ],
  webServer: [
    {
      command: `node apps/web/e2e/serve.ts main ${MAIN_PORT}`,
      url: `http://127.0.0.1:${MAIN_PORT}/`,
      timeout: 120_000,
      reuseExistingServer: !process.env['CI'],
    },
    {
      command: `node apps/web/e2e/serve.ts empty ${EMPTY_PORT}`,
      url: `http://127.0.0.1:${EMPTY_PORT}/`,
      timeout: 120_000,
      reuseExistingServer: !process.env['CI'],
    },
  ],
})
