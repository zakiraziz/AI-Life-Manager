export function register() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry is initialized via sentry.client.config.ts / sentry.edge.config.ts
    // This instrumentation hooks into Next.js error handlers
  }
}

export const handlers = {
  async onError(error: unknown) {
    // Server-side error capture — handled by Sentry edge config
    if (process.env.NODE_ENV === "development") {
      console.error("[Instrumented Error]", error);
    }
  },
};

export default { register, handlers };