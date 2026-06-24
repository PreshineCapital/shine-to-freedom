/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // This tells Next.js to build even if there are type issues
    ignoreBuildErrors: true,
  },
  eslint: {
    // This tells Next.js to build even if there are formatting warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;