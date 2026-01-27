import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out sensitive data
  beforeSend(event) {
    // Remove sensitive user data
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },

  // Performance monitoring
  tracesSampler(samplingContext) {
    // Don't sample health checks
    if (samplingContext.transactionContext?.name?.includes('/api/health')) {
      return 0;
    }
    // Sample everything else at 100% in development, 10% in production
    return process.env.NODE_ENV === 'production' ? 0.1 : 1.0;
  },
});
