import path from 'node:path'
import type { NextConfig } from 'next'

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@auteko/shared'],
  turbopack: { root: path.resolve(import.meta.dirname, '../..') },
}

export default config
