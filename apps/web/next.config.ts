import type { NextConfig } from 'next';

const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  async rewrites() {
    return [{ source: '/backend/:path*', destination: `${apiOrigin}/:path*` }];
  },
};

export default nextConfig;
