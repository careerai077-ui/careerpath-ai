// ============================================================
// lib/analytics/index.ts — Lightweight analytics hooks
// ============================================================

"use client";

// Safe PostHog / GA4 event tracker — fails silently if not configured

export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    // PostHog
    const ph = (window as unknown as Record<string, unknown>).posthog as
      | { capture: (e: string, p?: unknown) => void }
      | undefined;
    ph?.capture(event, props);

    // GA4
    const ga = (window as unknown as Record<string, unknown>).gtag as
      | ((cmd: string, event: string, params?: unknown) => void)
      | undefined;
    ga?.("event", event, props);
  } catch {
    // Never crash the app for analytics
  }
}

export const Events = {
  CAREER_SELECTED:   "career_selected",
  QUIZ_STARTED:      "quiz_started",
  ROADMAP_GENERATED: "roadmap_generated",
  ROADMAP_SAVED:     "roadmap_saved",
  ROADMAP_SHARED:    "roadmap_shared",
  PDF_DOWNLOADED:    "pdf_downloaded",
  COMPARE_VIEWED:    "compare_viewed",
  PRICING_VIEWED:    "pricing_viewed",
  MILESTONE_CHECKED: "milestone_checked",
  STREAK_EXTENDED:   "streak_extended",
} as const;
