/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    // Existing externals
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    // Add aliases for @/components and @/lib
    config.resolve.alias['@/components'] = path.resolve(__dirname, 'app/components');
    config.resolve.alias['@/lib'] = path.resolve(__dirname, 'app/lib');

    return config;
  },
};

module.exports = nextConfig;
const path = require('path');