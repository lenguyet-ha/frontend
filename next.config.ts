require("dotenv").config();
const appPort = process.env.NEXT_APP_PORT || 7030;
const localApi = process.env.NEXT_PUBLIC_API_URL || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    appDir: true,
  },
  compiler: {
    styledComponents: true,
  },
  serverRuntimeConfig: {
    APP_PORT: appPort,
  },
  publicRuntimeConfig: {
    API_URL: localApi,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    PORT: appPort,
    API_URL: localApi,
  },
  devServer: {
    port: appPort,
    API_URL: localApi,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
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
