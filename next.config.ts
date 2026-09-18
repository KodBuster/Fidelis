import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    localPatterns: [
      {
        pathname: "/images/**",
      },
      {
        pathname: "/api/advantshop-image",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s4.advantme.ru",
      },
      {
        protocol: "https",
        hostname: "**.on-advantshop.net",
      },
      {
        protocol: "http",
        hostname: "synonym-925.ru",
      },
      {
        protocol: "https",
        hostname: "synonym-925.ru",
      },
      {
        protocol: "http",
        hostname: "shop.synonym-jewelry.ru",
      },
      {
        protocol: "https",
        hostname: "shop.synonym-jewelry.ru",
      },
      {
        protocol: "https",
        hostname: "synonym-jewelry.ru",
      },
      {
        protocol: "https",
        hostname: "www.synonym-jewelry.ru",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/about", destination: "/", permanent: false },
      { source: "/blog", destination: "/", permanent: false },
      { source: "/blog/:path*", destination: "/", permanent: false },
      { source: "/showroom", destination: "/", permanent: false },
      { source: "/shop/gifts", destination: "/shop", permanent: false },
    ];
  },
};

export default nextConfig;
