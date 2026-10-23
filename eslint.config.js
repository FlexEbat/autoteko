import tseslint from 'typescript-eslint'

const FORBIDDEN_PACKAGES = [
  'xlsx',
  'jsonwebtoken',
  'bcryptjs',
  'dotenv',
  'moment',
  'moment-timezone',
  'redux',
  '@reduxjs/toolkit',
  'zustand',
  'prisma',
  '@prisma/client',
  'drizzle-orm',
  'knex',
  'typeorm',
  'sequelize',
  'kysely',
  'styled-components',
  '@emotion/react',
  '@emotion/styled',
  '@mui/material',
  '@chakra-ui/react',
  'antd',
]

// Letters outside the Latin script. Allowed only in dictionaries and domain-literals.ts.
const NON_LATIN = String.raw`/(?!\p{Script=Latin})\p{L}/u`

const syntaxRules = [
  {
    selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
    message: 'Escaping bypass is forbidden (tech.md, section 18).',
  },
  {
    selector: 'CallExpression[callee.property.name=/^(query|one)$/] > TemplateLiteral:first-child',
    message: 'Build queries with the sql tag, not a template string.',
  },
  {
    selector: 'CallExpression[callee.property.name=/^(query|one)$/] > BinaryExpression:first-child',
    message: 'Build queries with the sql tag, not string concatenation.',
  },
  { selector: 'Literal[value=/not implemented/i]', message: 'Stubs are forbidden: implement the behavior.' },
  {
    selector: 'TemplateElement[value.raw=/not implemented/i]',
    message: 'Stubs are forbidden: implement the behavior.',
  },
]

const nonLatinRules = [
  {
    selector: `Literal[value=${NON_LATIN}]`,
    message: 'Non-Latin text belongs in a dictionary or domain-literals.ts.',
  },
  {
    selector: `TemplateElement[value.raw=${NON_LATIN}]`,
    message: 'Non-Latin text belongs in a dictionary or domain-literals.ts.',
  },
  {
    selector: `JSXText[value=${NON_LATIN}]`,
    message: 'Non-Latin text belongs in a dictionary or domain-literals.ts.',
  },
]

const testRules = [
  {
    selector:
      'CallExpression[callee.object.name=/^(test|it|describe)$/][callee.property.name=/^(skip|only|todo|fails|skipIf)$/]',
    message: 'skip, only and todo are forbidden in tests.',
  },
  {
    selector: 'CallExpression[callee.name=/^(xtest|xit|xdescribe|fit|fdescribe)$/]',
    message: 'skip and only variants are forbidden in tests.',
  },
  {
    selector:
      'CallExpression[callee.object.object.name=/^(test|it|describe)$/][callee.object.property.name=/^(skip|only|todo)$/]',
    message: 'skip, only and todo are forbidden in tests.',
  },
]

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/coverage/**',
      'apps/web/next-env.d.ts',
      'lint-fixtures/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-warning-comments': ['error', { terms: ['todo', 'fixme'], location: 'anywhere' }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'node:child_process',
              importNames: ['exec', 'execSync'],
              message: 'Use execFile with an argument array.',
            },
            {
              name: 'child_process',
              importNames: ['exec', 'execSync'],
              message: 'Use execFile with an argument array.',
            },
          ],
          patterns: [
            {
              group: FORBIDDEN_PACKAGES.flatMap((name) => [name, `${name}/*`]),
              message: 'This package is forbidden (tech.md, section 2).',
            },
          ],
        },
      ],
      'no-restricted-syntax': ['error', ...syntaxRules, ...nonLatinRules],
    },
  },
  {
    // The config states the forbidden patterns, so it cannot be checked against them.
    files: ['eslint.config.js'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['**/i18n/**', '**/domain-literals.ts'],
    rules: { 'no-restricted-syntax': ['error', ...syntaxRules] },
  },
  {
    files: ['**/tests/**', '**/e2e/**', '**/*.test.ts'],
    rules: { 'no-restricted-syntax': ['error', ...syntaxRules, ...nonLatinRules, ...testRules] },
  },
  {
    files: ['apps/web/src/server/**/*.ts'],
    rules: {
      'no-console': 'error',
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Use node:crypto in server code.' },
      ],
    },
  },
)
