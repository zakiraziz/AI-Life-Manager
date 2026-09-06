export async function register() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry is initialized via sentry.client.config.ts / sentry.edge.config.ts.
    // register() is required for Next.js to treat this file as instrumentation;
    // actual error capture is handled by the Sentry SDK lifecycle.
  }
}