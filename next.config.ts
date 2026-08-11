import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // El design system se distribuye como TS/ESM sin transpilar: Next tiene que
  // compilarlo junto con la app (mismo tratamiento que en olibia-web).
  transpilePackages: ['@biaenergy/ui']
};

export default nextConfig;
