import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['your-image-domain.com'],
  },
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Adjust this value based on your needs
    },
  },
  reactStrictMode: true,
};

export default nextConfig;
