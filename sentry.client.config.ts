import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Add React component stack traces (for error boundaries)
  // when available in the browser
  componentStack: true,
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