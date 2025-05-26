// Environment configuration with validation and fallbacks
export const config = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // App Configuration with fallbacks
  app: {
    url: getAppUrl(),
    environment: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",
  },

  // Vercel specific
  vercel: {
    url: process.env.VERCEL_URL,
    env: process.env.VERCEL_ENV,
    region: process.env.VERCEL_REGION,
  },
}

function getAppUrl(): string {
  // 1. 명시적으로 설정된 APP_URL이 있으면 사용
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // 2. Vercel 환경에서는 VERCEL_URL 사용
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // 3. 개발 환경에서는 localhost 사용
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000"
  }

  // 4. 기본값
  return "http://localhost:3000"
}

// Validate required environment variables
export function validateConfig() {
  const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`)
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }

  console.log("✅ All required environment variables are set")
  console.log("App URL:", config.app.url)
  console.log("Environment:", config.app.environment)
}
