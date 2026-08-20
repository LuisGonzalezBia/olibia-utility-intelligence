import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Empaqueta el server y solo las dependencias que realmente se importan en
  // .next/standalone, para que la imagen de produccion no cargue node_modules
  // entero (~1 GB con el design system y sus peers).
  output: 'standalone',
  // Sin esto, Turbopack sale a buscar lockfiles hacia arriba y, al encontrar
  // los de otros repos vecinos en ~/Documents/repos, infiere una raiz que no es
  // la nuestra. Anclarla hace que el build no dependa de que haya al lado.
  turbopack: { root: path.resolve(import.meta.dirname) },
  // El design system se distribuye como TS/ESM sin transpilar: Next tiene que
  // compilarlo junto con la app (mismo tratamiento que en olibia-web).
  transpilePackages: ['@biaenergy/ui']
};

export default nextConfig;
