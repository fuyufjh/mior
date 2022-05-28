/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*'
      },
      {
        source: '/rss',
        destination: 'http://127.0.0.1:8000/rss'
      }
    ]
  }
};
