export const config = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vmrrhtqrwovzhnfegpdc.supabase.co",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcnJodHFyd292emhuZmVncGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTYzNzQsImV4cCI6MjA4NzAzMjM3NH0.c0TBkcH9A-LI6VWC6u7nqaI4AR-o9MDiGYBmlTCgTFE",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "sb_publishable_K-AErdydQMRbpHQ_4RQmDQ_dOEEWjTO",
  stripeProLink: process.env.NEXT_PUBLIC_STRIPE_PRO_LINK || "https://buy.stripe.com/5kQdR9gnHelNffBb7O0Ny00",
  stripeBusinessLink: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_LINK || "https://buy.stripe.com/4gMaEX3AVgtV8RddfW0Ny01",
  promo5: "ЛАСКАВО ПРОСИМО5",
  promo10: "ЛАСКАВО ПРОСИМО10",
};
