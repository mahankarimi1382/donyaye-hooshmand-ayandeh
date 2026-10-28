import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/core', 'packages/contracts', 'packages/i18n', 'packages/ui', 'apps/web'],
  },
});
