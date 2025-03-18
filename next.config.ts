import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uoxcxkquwakpdmpiyvzy.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default bundleAnalyzer(nextConfig);