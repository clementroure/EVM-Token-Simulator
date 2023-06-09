/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest.json$/],
});
const nextConfig = withPWA({
  experimental: {
    appDir: true,
  },
});

module.exports = nextConfig;
