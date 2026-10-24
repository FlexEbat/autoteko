import { describe, expect, test } from 'vitest'
import { checkCommitMessage } from '../../../scripts/check-commit-msg.ts'

describe('check-commit-msg', () => {
  test('S0B.3: accepts conventional messages and service commits', () => {
    const accepted = [
      'feat(deals): add overdue filter',
      'Merge branch "x"',
      'Merge pull request #1 from a/b',
      'Revert "feat(a): b"',
      'fix(a-1): a 3d thing',
      `chore(x): ${'a'.repeat(50)}`,
      'test(calc): cover manual cost mode\n\nbody explains why',
      '# comment line\nfeat(a): b',
    ]
    for (const message of accepted) expect(checkCommitMessage(message), message).toBeUndefined()
  })

  test('S0B.3: rejects each kind of violation', () => {
    const rejected: [string, string][] = [
      ['wip(a): b', 'unknown type'],
      ['feat: add thing', 'missing scope'],
      ['feat(): add thing', 'empty scope'],
      ['feat(Deals): add thing', 'upper case scope'],
      ['feat(a): Add thing', 'capital first letter'],
      ['feat(a): add thing.', 'trailing period'],
      [`feat(a): ${'a'.repeat(51)}`, '51 characters'],
      ['', 'empty'],
      ['   \n\n', 'blank'],
      ['# only a comment', 'only comments'],
      ['feat(a):b', 'no space'],
    ]
    for (const [message, why] of rejected) expect(checkCommitMessage(message), why).toBeTypeOf('string')
  })
})
