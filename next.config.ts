import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "fastly.4sqi.net",
      },
      {
        protocol: "https",
        hostname: "ss3.4sqi.net",
      },
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "places.googleapis.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/render/:path*',
        destination: 'https://apirestaurantes.onrender.com/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vlibras.gov.br; style-src 'self' 'unsafe-inline' https://vlibras.gov.br; img-src 'self' data: blob: https:; font-src 'self' data: https://vlibras.gov.br; connect-src 'self' https://places.googleapis.com https://maps.googleapis.com ws: wss: https://vlibras.gov.br; frame-src 'self' https://www.google.com https://maps.google.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
