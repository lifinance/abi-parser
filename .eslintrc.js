module.exports = {
    root: true,
    ignorePatterns: ['.eslintrc.js'],
    env: {
        node: true,
        es2021: true,
    },
    parserOptions: {
        project: './tsconfig.json',
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:promise/recommended',
        'plugin:prettier/recommended',
    ],
    plugins: ['no-null', 'prefer-arrow'],
    rules: {
        'newline-before-return': 'error',
        'prefer-template': 'error',
        'object-shorthand': ['error', 'always'],
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_' }],
        'no-null/no-null': 'error',
        'prefer-arrow/prefer-arrow-functions': [
            'error',
            {
                classPropertiesAllowed: true,
            },
        ],
        'promise/prefer-await-to-then': 'error',
    },
    reportUnusedDisableDirectives: true,
};
