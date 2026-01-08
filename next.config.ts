import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config: any) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  experimental: {
    esmExternals: true
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  // Only use rewrites in development
  async rewrites() {
    // Only proxy API requests in development (localhost)
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000/api/:path*',
          basePath: false
        }
      ];
    }
    return [];
  },
  // Output configuration for Docker deployment (optional)
  output: 'standalone',
};

export default nextConfig;
