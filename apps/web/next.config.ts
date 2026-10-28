import createNextIntlPlugin from 'next-intl/plugin';

import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  transpilePackages: ['@karvan/core', '@karvan/contracts', '@karvan/i18n', '@karvan/ui'],
};

export default withNextIntl(nextConfig);
