import { expect, test } from '@playwright/test'
import { watchProblems } from './support.ts'

test('S0B.6: the built app starts on the main instance with a clean console and no CSP violations', async ({
  page,
}) => {
  const problems = watchProblems(page)
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.waitForLoadState('networkidle')
  expect(problems).toEqual([])
})

test('S0A.14: the built app sets security headers on a page and on a missing page', async ({ request }) => {
  for (const path of ['/', '/no/such/page']) {
    const response = await request.get(path)
    const headers = response.headers()
    expect(headers['content-security-policy'], path).toContain("frame-ancestors 'none'")
    expect(headers['x-content-type-options'], path).toBe('nosniff')
    expect(headers['x-frame-options'], path).toBe('DENY')
    expect(headers['referrer-policy'], path).toBe('no-referrer')
  }
})
