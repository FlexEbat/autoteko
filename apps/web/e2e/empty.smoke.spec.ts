import { expect, test } from '@playwright/test'
import { watchProblems } from './support.ts'

test('S0B.6: the built app starts on the instance with an empty database with a clean console and no CSP violations', async ({
  page,
}) => {
  const problems = watchProblems(page)
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.waitForLoadState('networkidle')
  expect(problems).toEqual([])
})
