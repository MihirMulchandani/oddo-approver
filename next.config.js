const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    // Aliases
    config.resolve.alias['@/components'] = path.join(__dirname, 'app/components');
    config.resolve.alias['@/lib'] = path.join(__dirname, 'app/lib');

    // Existing externals
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    return config;
  },
};

module.exports = nextConfig;
