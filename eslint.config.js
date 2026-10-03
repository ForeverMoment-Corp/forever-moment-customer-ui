import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Colours belong in the palette (src/styles/theme.scss); use text-gold / var(--gold) instead.
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'Literal[value=/#[0-9a-fA-F]{6}\\b/]',
          message: 'Hardcoded colour. Use a palette token from src/styles/theme.scss (e.g. text-gold, var(--gold)).',
        },
        {
          selector: 'TemplateElement[value.raw=/#[0-9a-fA-F]{6}\\b/]',
          message: 'Hardcoded colour. Use a palette token from src/styles/theme.scss (e.g. text-gold, var(--gold)).',
        },
      ],
    },
  },
]);
