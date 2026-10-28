import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // Endereços do site antigo (.html) continuam funcionando
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/:page(portfolio|produtos|sobre|contato|privacidade).html', destination: '/:page', permanent: true },
      { source: '/obras/:slug([^/.]+).html', destination: '/obras/:slug', permanent: true },
      { source: '/produtos/:slug([^/.]+).html', destination: '/produtos/:slug', permanent: true },
      { source: '/blog/index.html', destination: '/blog', permanent: true },
      { source: '/blog/:slug/index.html', destination: '/blog/:slug', permanent: true },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: { root: path.resolve(dirname) },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
