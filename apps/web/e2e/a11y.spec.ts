import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// The login page does not exist before slice 1, so the start page and the 404 page stand in for it.
for (const path of ['/', '/no/such/page']) {
  test(`S0B.7: ${path} has no axe violations`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
}
