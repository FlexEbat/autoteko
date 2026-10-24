export default {
  testRunner: 'vitest',
  vitest: { configFile: 'vitest.mutation.config.ts' },
  // Pure modules only (tech.md, section 9).
  mutate: [
    'packages/shared/src/{money,calc,stock,dates,ids,normalize,permissions}.ts',
    'apps/web/src/server/security/safe-redirect.ts',
    'scripts/check-commit-msg.ts',
  ],
  thresholds: { high: 90, low: 80, break: 80 },
  reporters: ['clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  ignoreStatic: true,
}
