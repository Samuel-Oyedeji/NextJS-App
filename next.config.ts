import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uoxcxkquwakpdmpiyvzy.supabase.co',
        pathname: '/storage/v1/object/public/**', // Optional but recommended
      },
    ],
  },
};

export default nextConfig;