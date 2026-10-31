import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      // Accounts are created by Melon onboarding and invitations, not public signup
      { source: '/signup', destination: '/login', permanent: false },
    ];
  },
};

export default nextConfig;