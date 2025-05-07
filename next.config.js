/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: false,
  exportPathMap: async function (defaultPathMap) {
    return {
      ...defaultPathMap,
      '/login': { page: '/login' },
    };
  },
};

module.exports = nextConfig;
