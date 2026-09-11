export function getAuthErrorMessage(error: Error): string {
  const msg = error.message?.toLowerCase() || "";

  // Network / connection issues
  if (msg.includes("failed to fetch") || msg.includes("networkerror") || msg.includes("fetch failed")) {
    return "Cannot connect to the server. Check your internet connection or Supabase configuration in .env.local.";
  }
  if (msg.includes("invalid api key") || msg.includes("invalid key") || msg.includes("anon key")) {
    return "The Supabase API key is invalid. Update NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local with your real key.";
  }
  if (msg.includes("supabase.co") && msg.includes("placeholder")) {
    return "Supabase is not configured. Replace the placeholder values in .env.local with your real project URL and anon key.";
  }

  // Login errors
  if (msg.includes("invalid login credentials")) {
    return "Email or password is incorrect. Try again or use a magic link below.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please check your email and click the confirmation link before signing in.";
  }
  if (msg.includes("too many requests") || msg.includes("rate limit")) {
    return "Too many attempts. Please wait a minute and try again.";
  }

  // Signup errors
  if (msg.includes("already registered") || msg.includes("already exists")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (msg.includes("password") && msg.includes("6")) {
    return "Password must be at least 6 characters long.";
  }
  if (msg.includes("invalid email")) {
    return "Please enter a valid email address.";
  }
  if (msg.includes("unable to validate email")) {
    return "This email address cannot be used. Try a different one.";
  }

  // Fallback — show the raw message
  return error.message || "Something went wrong. Please try again.";
}