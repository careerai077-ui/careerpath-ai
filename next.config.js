/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15: server-only packages (keeps AI SDKs out of client bundles)
  serverExternalPackages: ["groq-sdk", "@google/generative-ai", "@anthropic-ai/sdk", "openai"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
    // Optimise for slow mobile connections
    deviceSizes: [360, 414, 768, 1080, 1440],
    formats: ["image/webp"],
  },

  // Security + performance headers on every route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control",  value: "on" },
          { key: "X-Frame-Options",          value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options",   value: "nosniff" },
          { key: "X-XSS-Protection",         value: "1; mode=block" },
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control",     value: "no-store, no-cache, must-revalidate" },
          { key: "X-Robots-Tag",      value: "noindex" },
          { key: "Content-Type",      value: "application/json" },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // Compress output
  compress: true,

  // Prevent builds from failing on lint warnings (only hard errors block)
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  // Standalone output for Docker / self-hosted deployments
  // output: "standalone",  // Uncomment if deploying with Docker
};

module.exports = nextConfig;
