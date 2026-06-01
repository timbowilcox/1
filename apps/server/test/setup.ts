// Provide dummy env so modules that import the (boot-validated) environment can
// load under test. Real values are never needed for these unit tests.
const defaults: Record<string, string> = {
  NODE_ENV: "test",
  SESSION_SECRET: "test-session-secret-at-least-32-characters",
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  CLIENT_URL: "http://localhost:3000",
  PLAN_LIMIT_FREE: "3",
  PLAN_LIMIT_PRO: "200",
  PLAN_LIMIT_PRO_PLUS: "1000",
  GEMINI_API_KEY: "test",
  OPENAI_API_KEY: "test",
  SD_API_KEY: "test",
  GEMINI_MODEL: "test-model",
  STRIPE_SECRET_KEY: "sk_test",
  STRIPE_WEBHOOK_SECRET: "whsec_test",
  STRIPE_PRICE_ID_PRO: "price_pro",
  STRIPE_PRICE_ID_PRO_PLUS: "price_proplus",
  STRIPE_PORTAL_CONFIGURATION: "bpc_test",
  SUPABASE_URL: "http://localhost:54321",
  SUPABASE_SERVICE_ROLE_KEY: "test",
  SUPABASE_BUCKET_NAME: "test-bucket",
};

for (const [key, value] of Object.entries(defaults)) {
  if (!process.env[key]) process.env[key] = value;
}
