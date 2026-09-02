import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // React component stack traces for error boundaries are captured
  // automatically via Sentry's React integration.
  // Adjust this value in production, or use a separate environment level
  tracesSampleRate: 1.0,
  // Hide schema warnings from the browser console
  // unless we're in development
  beforeSend(event) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Sentry] Capturing event:", event);
    }
    return event;
  },
});