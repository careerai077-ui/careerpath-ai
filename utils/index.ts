// ============================================================
// utils/index.ts — Shared utility functions
// ============================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";

// ── Class utility (shadcn pattern) ───────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── ID generators ─────────────────────────────────────────────
export const generateId = (length = 12) => nanoid(length);
export const generateShareSlug = () => nanoid(10);

// ── Format helpers ────────────────────────────────────────────

export function formatSalary(lpa: number): string {
  if (lpa >= 100) return `₹${(lpa / 100).toFixed(1)} Cr LPA`;
  return `₹${lpa} LPA`;
}

export function formatSalaryRange(min: number, max: number): string {
  return `${formatSalary(min)} – ${formatSalary(max)}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

// ── Progress helpers ──────────────────────────────────────────

export function getProgressColor(progress: number): string {
  if (progress >= 80) return "text-emerald-400";
  if (progress >= 50) return "text-brand-400";
  if (progress >= 25) return "text-amber-400";
  return "text-slate-400";
}

export function getProgressLabel(progress: number): string {
  if (progress >= 100) return "Completed! 🎉";
  if (progress >= 80) return "Almost there!";
  if (progress >= 50) return "Great progress";
  if (progress >= 25) return "Getting started";
  return "Just beginning";
}

// ── XP & Level ────────────────────────────────────────────────

export function getXPLevel(totalXP: number): { level: number; title: string; nextLevelXP: number } {
  const levels = [
    { min: 0, title: "Beginner" },
    { min: 100, title: "Explorer" },
    { min: 300, title: "Learner" },
    { min: 600, title: "Builder" },
    { min: 1000, title: "Practitioner" },
    { min: 1500, title: "Developer" },
    { min: 2500, title: "Expert" },
    { min: 4000, title: "Master" },
    { min: 6000, title: "Legend" },
  ];

  let level = 1;
  let title = "Beginner";
  let nextLevelXP = 100;

  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalXP >= levels[i].min) {
      level = i + 1;
      title = levels[i].title;
      nextLevelXP = levels[i + 1]?.min ?? levels[i].min * 2;
      break;
    }
  }

  return { level, title, nextLevelXP };
}

// ── SEO helpers ───────────────────────────────────────────────

export function generateMetaTitle(careerLabel: string): string {
  return `${careerLabel} Roadmap in India 2025 | CareerPath AI`;
}

export function generateMetaDescription(careerLabel: string, avgSalary: string): string {
  return `Complete ${careerLabel} roadmap for India — skills, salary (${avgSalary}), certifications, projects, and 90-day plan. Free AI-powered career guide.`;
}

export function generateCanonicalUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://careerpathai.in";
  return `${base}${path}`;
}

// ── String helpers ────────────────────────────────────────────

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Streak helpers ────────────────────────────────────────────

export function calculateStreak(lastActiveDate: string, currentStreak: number): number {
  const last = new Date(lastActiveDate);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return currentStreak; // Same day
  if (diffDays === 1) return currentStreak + 1; // Consecutive day
  return 0; // Streak broken
}

export function isStreakAtRisk(lastActiveDate: string): boolean {
  const last = new Date(lastActiveDate);
  const now = new Date();
  const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
  return diffHours > 20 && diffHours < 48; // Within danger zone
}

// ── Analytics helpers ─────────────────────────────────────────

export function safeTrack(event: string, props?: Record<string, unknown>) {
  // Safe analytics tracking that won't crash if not configured
  try {
    if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).posthog) {
      ((window as unknown as Record<string, unknown>).posthog as { capture: (e: string, p?: unknown) => void }).capture(event, props);
    }
  } catch {
    // Silently fail
  }
}
