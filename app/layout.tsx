// ============================================================
// app/layout.tsx — Root layout (Server Component)
// ============================================================

import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

// ── Fonts ─────────────────────────────────────────────────────

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

// ── Metadata ─────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://careerpathai.in"),
  title: {
    default: "CareerPath AI India — AI-Powered Career Roadmaps for Indian Students",
    template: "%s | CareerPath AI India",
  },
  description:
    "Get a personalized AI career roadmap for any field in India. Includes salary data, skills, projects, certifications, and a 90-day action plan. Free for students.",
  keywords: [
    "career roadmap India",
    "AI career guide India",
    "career after 12th",
    "career after graduation India",
    "best careers India 2025",
    "salary in India",
    "full stack developer roadmap India",
    "data scientist roadmap India",
    "IT careers India",
    "career planning for students India",
  ],
  authors: [{ name: "CareerPath AI India" }],
  creator: "CareerPath AI India",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://careerpathai.in",
    siteName: "CareerPath AI India",
    title: "CareerPath AI India — AI Career Roadmaps for Indian Students",
    description:
      "Free AI-powered career roadmaps for Indian students and professionals. Get your personalized path with salary data, skills, and action plans.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CareerPath AI India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerPath AI India — Free AI Career Roadmaps",
    description: "AI-powered career roadmaps for Indian students. Skills, salary, projects, and action plans.",
    images: ["/og-image.png"],
    creator: "@careerpathaiIN",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#080C14",
  width: "device-width",
  initialScale: 1,
};

// ── Root Layout ───────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${syne.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "CareerPath AI India",
              url: "https://careerpathai.in",
              description: "AI-powered career roadmaps for Indian students and professionals",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://careerpathai.in/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        {/* Ambient background */}
        <div className="mesh-bg" aria-hidden="true" />

        {/* Main content */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>

        {/* Toast notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(13,17,31,0.95)",
              color: "hsl(213,31%,91%)",
              border: "1px solid rgba(99,102,241,0.2)",
              backdropFilter: "blur(16px)",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#34D399", secondary: "transparent" } },
            error: { iconTheme: { primary: "#F87171", secondary: "transparent" } },
          }}
        />
      </body>
    </html>
  );
}
