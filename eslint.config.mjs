import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    ignores: [
      '.next/',
      'node_modules/',
      'kit/',
      'design-reference/',
      'src/payload-types.ts',
      'src/migrations/*.json',
      'src/migrations/2*.ts',
      'src/app/(payload)/admin/importMap.js',
      'playwright-report/',
      'test-results/',
      'next-env.d.ts',
    ],
  },
]

export default eslintConfig
