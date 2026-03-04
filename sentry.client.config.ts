import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Capture 10% des transactions en prod pour le perf monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Désactivé en dev pour ne pas polluer Sentry
  enabled: process.env.NODE_ENV === 'production',

  // Pas de replay session (données clients sensibles)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
})
