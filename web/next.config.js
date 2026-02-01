/** @type {import('next').NextConfig} */
const apiUpstream = process.env.API_UPSTREAM || 'http://localhost:3001'

const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${apiUpstream}/api/:path*` },
    ]
  },
}

module.exports = nextConfig
