/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development'

const CSP = [
  "default-src 'self'",
  // Next.js hydration + GTM/Clarity inline snippets nécessitent unsafe-inline
  // unsafe-eval requis par webpack en développement (HMR)
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.clarity.ms`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  // Supabase (REST + Realtime WebSocket) + analytics
  [
    "connect-src 'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://www.clarity.ms",
    "https://c.clarity.ms",
  ].join(' '),
  // Next.js charge les fonts en data URI
  "font-src 'self' data:",
  // iframe GTM noscript pixel
  "frame-src https://www.googletagmanager.com",
  "frame-ancestors 'none'",
].join('; ')

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy',   value: CSP },
        ],
      },
    ]
  },
}

module.exports = nextConfig