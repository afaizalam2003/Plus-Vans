export const PATHS = {
  ADMIN: '/admin',
  SIGN_IN: '/auth/signin',
  SIGN_UP: '/auth/signup',
  FORGOT_PASSWORD: '/auth/forgot-password',
} as const;

export const PUBLIC_PATHS = [
  PATHS.SIGN_IN,
  PATHS.SIGN_UP,
  PATHS.FORGOT_PASSWORD,
  "/api/auth",
  "/_next",
  "/static",
  "/images",
  "/favicon.ico",
  "/logo.png",
  "/api/trpc",
  "/_next/static",
  "/_next/image",
  "/_vercel/insights/script.js",
];

export const AUTH_PAGES = [
  PATHS.SIGN_IN,
  PATHS.SIGN_UP,
  PATHS.FORGOT_PASSWORD,
];
