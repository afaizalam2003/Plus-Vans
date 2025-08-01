const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ["res.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // Configure path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@/*': path.resolve(__dirname, './*'),
    };

    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: '/admin',
  //       destination: '/',
  //     },
  //     {
  //       source: '/admin/:path*',
  //       destination: '/:path*',
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
