/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'global.canon',
        port: '',
        pathname: '/ja/c-museum/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'global.canon',
        port: '',
        pathname: '/en/c-museum/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.usa.canon.com',
        port: '',
        pathname: '/images/**',
      }
    ],
    // Optimize image loading
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@tailwindcss/typography'],
  },
  
  // Optimize for production
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Enable compression
  compress: true,
  
  // Handle trailing slashes
  trailingSlash: false,
}

module.exports = nextConfig 