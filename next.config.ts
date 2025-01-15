import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['https://drive.google.com'],
  },
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Adjust this value based on your needs
    },
  },
  reactStrictMode: true,
};

export default nextConfig;
