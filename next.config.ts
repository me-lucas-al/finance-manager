import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  serverExternalPackages: ["@whiskeysockets/baileys"],
};

export default nextConfig;
