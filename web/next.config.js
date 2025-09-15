/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  
  // Environment variables
  env: {
    TRADINGAGENTS_API_URL: process.env.TRADINGAGENTS_API_URL || 'http://tradingagents:8000',
    MCP_CRYPTO_URL: process.env.MCP_CRYPTO_SERVER_URL || 'http://mcp-crypto:9000',
    MCP_NEWS_URL: process.env.MCP_NEWS_SERVER_URL || 'http://mcp-news:9001',
  },

  // API routes
  async rewrites() {
    return [
      {
        source: '/api/tradingagents/:path*',
        destination: `${process.env.TRADINGAGENTS_API_URL || 'http://tradingagents:8000'}/api/:path*`,
      },
      {
        source: '/api/mcp-crypto/:path*',
        destination: `${process.env.MCP_CRYPTO_SERVER_URL || 'http://mcp-crypto:9000'}/:path*`,
      },
      {
        source: '/api/mcp-news/:path*',
        destination: `${process.env.MCP_NEWS_SERVER_URL || 'http://mcp-news:9001'}/:path*`,
      },
    ];
  },

  // Headers for API calls
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;