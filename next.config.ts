import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

function r2RemotePatterns(): Array<{
  protocol: 'http' | 'https'
  hostname: string
  pathname: string
}> {
  const value = process.env.R2_PUBLIC_URL
  if (process.env.R2_BUCKET && !value) {
    throw new Error('R2_PUBLIC_URL must be set when R2_BUCKET is configured so next/image can load CMS media')
  }
  if (!value) return []

  try {
    const url = new URL(value)
    return [
      {
        protocol: url.protocol.replace(':', '') as 'http' | 'https',
        hostname: url.hostname,
        pathname: '/**',
      },
    ]
  } catch {
    return []
  }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Keep Zeist available to the PDF generator in serverless/Netlify builds.
  outputFileTracingIncludes: {
    '/api/portal/applications/[id]/pdf': [
      './src/fonts/ZeistL1Web-Book.ttf',
      './src/fonts/ZeistL1Web-Book.woff2',
      './src/fonts/ZeistL1Web-Book.woff',
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/api/media/file/**',
      },
      ...r2RemotePatterns(),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
