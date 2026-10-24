import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { checkWorkflows } from '../../../scripts/check-workflows.ts'

const SHA = 'fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09'
const GOOD = `name: x
on: [push]
permissions:
  contents: read
jobs:
  a:
    steps:
      - uses: actions/checkout@${SHA} # v5.1.0
      - uses: ./local-action
`

describe('check-workflows', () => {
  test('S0B.4: accepts a pinned, read-only workflow', () => {
    expect(checkWorkflows({ 'good.yml': GOOD })).toEqual([])
  })

  test('S0B.4: rejects an action that is not pinned to a full SHA with a version comment', () => {
    const bad = [
      GOOD.replace(SHA, 'v5'),
      GOOD.replace(SHA, 'abc1234'),
      GOOD.replace(` # v5.1.0`, ''),
      GOOD.replace(SHA, SHA.slice(0, 39)),
    ]
    for (const text of bad) expect(checkWorkflows({ 'bad.yml': text }).join()).toMatch(/pinned/)
  })

  test('S0B.4: rejects permissions other than contents read at the top level', () => {
    const cases = [
      GOOD.replace('permissions:\n  contents: read\n', ''),
      GOOD.replace('contents: read', 'contents: write'),
      GOOD.replace('permissions:\n  contents: read', 'permissions: write-all'),
      GOOD.replace('contents: read', 'contents: read\n  packages: write'),
      GOOD.replace('permissions:\n  contents: read', 'permissions: read-all'),
    ]
    for (const text of cases) expect(checkWorkflows({ 'bad.yml': text }).length).toBeGreaterThan(0)
  })

  test('S0B.4: rejects pull_request_target and write-all', () => {
    expect(checkWorkflows({ 'a.yml': GOOD.replace('[push]', '[pull_request_target]') }).join()).toMatch(
      /pull_request_target/,
    )
    expect(checkWorkflows({ 'a.yml': `${GOOD}# permissions: write-all\n` }).join()).toMatch(/write-all/)
  })

  test('S0B.4: accepts the current workflow files', () => {
    const dir = path.resolve(import.meta.dirname, '../../../.github/workflows')
    const files = Object.fromEntries(
      readdirSync(dir).map((name) => [name, readFileSync(path.join(dir, name), 'utf8')]),
    )
    expect(Object.keys(files).length).toBeGreaterThan(0)
    expect(checkWorkflows(files)).toEqual([])
  })

  test('S0B.10: dependabot.yml lists npm, github-actions and docker and covers every workspace', () => {
    const text = readFileSync(path.resolve(import.meta.dirname, '../../../.github/dependabot.yml'), 'utf8')
    const blocks = text.split(/^\s*- package-ecosystem:/m).slice(1)
    const ecosystem = (block: string): string => /^\s*["']?([a-z-]+)["']?/.exec(block)?.[1] ?? ''
    expect(blocks.map(ecosystem)).toEqual(expect.arrayContaining(['npm', 'github-actions', 'docker']))
    const npm = blocks.find((block) => ecosystem(block) === 'npm') ?? ''
    const directories = [...npm.matchAll(/^\s+- ["']?(\/[^"'\s]*)["']?\s*$/gm)].map((m) => m[1])
    expect(directories).toEqual(expect.arrayContaining(['/', '/apps/web', '/packages/shared']))
  })
})
