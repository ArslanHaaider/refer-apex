import type { NextConfig } from "next";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // Next.js ships small inline bootstrap scripts; a nonce-based CSP would
  // let us drop 'unsafe-inline' here, but that requires threading a nonce
  // through middleware and every <Script> — left as a follow-up.
  "script-src 'self' 'unsafe-inline' https://accounts.google.com https://www.google.com https://www.gstatic.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
  "img-src 'self' data: https://*.googleusercontent.com https://*.google.com https://www.gstatic.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' ${SUPABASE_URL} https://www.googleapis.com https://content.googleapis.com https://accounts.google.com https://graph.facebook.com https://www.facebook.com`.trim(),
  "frame-src https://accounts.google.com https://www.google.com https://www.facebook.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
