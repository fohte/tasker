import { mainConfig, typescriptConfig } from '@fohte/eslint-config'

const config = [
  ...mainConfig,
  ...typescriptConfig,
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*'],
              message:
                'Please use absolute imports instead of relative imports.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['.next/', 'next-env.d.ts', '.vercel/', 'drizzle/'],
  },
]

export default config
