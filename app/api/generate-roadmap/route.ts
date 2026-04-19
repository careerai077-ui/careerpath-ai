// ============================================================
// app/api/generate-roadmap/route.ts — Hardened production API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { generateRoadmapAdvice } from "@/lib/ai-advisor";
import { calculateConfidenceScore } from "@/lib/recommendation-engine";
import { estimateTimeToJob } from "@/lib/roadmap-engine/template-builder";
import { getCareerById } from "@/data/careers";
import type { GeneratedRoadmap } from "@/types";

// ── Env validation at cold start ──────────────────────────────
// Warn loudly if neither AI provider is configured
if (
  !process.env.GROQ_API_KEY &&
  !process.env.GEMINI_API_KEY &&
  !process.env.ANTHROPIC_API_KEY &&
  !process.env.OPENAI_API_KEY
) {
  console.warn(
    "[CareerPath AI] ⚠️  No AI provider configured. " +
    "Set GROQ_API_KEY (free) or GEMINI_API_KEY (free) in .env.local. " +
    "Falling back to template mode only."
  );
}

// ── Zod schema — all fields bounded ──────────────────────────

const AnswersSchema = z.object({
  education:    z.string().min(1).max(120),
  level:        z.enum(["beginner", "intermediate", "advanced"]),
  timePerDay:   z.string().min(1).max(60),
  budget:       z.string().min(1).max(80),
  targetSalary: z.string().min(1).max(80),
  goalType:     z.enum(["job", "freelance", "startup", "international", "higher_studies", "government"]),
  city:         z.string().min(1).max(80),
  strengths:    z.string().max(300).optional().default(""),
  weakAreas:    z.string().max(300).optional().default(""),
  motivation:   z.string().max(500).optional().default(""),
});

const RequestSchema = z.object({
  careerId:          z.string().min(1).max(50),
  careerLabel:       z.string().min(1).max(120),
  answers:           AnswersSchema,
  preferredProvider: z.enum(["anthropic", "openai", "gemini", "template"]).optional(),
});

// ── Rate limiter — per IP with burst protection ───────────────

interface RateLimitEntry {
  count:    number;
  resetAt:  number;
  lastCall: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT     = 5;           // max requests
const RATE_WINDOW    = 60 * 60 * 1000;  // per hour
const MIN_INTERVAL   = 8_000;       // 8 s minimum between requests per IP

// Prune old entries every 500 calls
let pruneCounter = 0;
function pruneStore() {
  if (++pruneCounter % 500 !== 0) return;
  const now = Date.now();
  for (const [key, val] of rateLimitStore) {
    if (val.resetAt < now) rateLimitStore.delete(key);
  }
}

function checkRateLimit(ip: string): { allowed: boolean; reason?: string } {
  const now   = Date.now();
  const entry = rateLimitStore.get(ip);
  pruneStore();

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW, lastCall: now });
    return { allowed: true };
  }

  // Burst guard: minimum 8 s between requests
  if (now - entry.lastCall < MIN_INTERVAL) {
    return { allowed: false, reason: "Please wait a few seconds before generating another roadmap." };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, reason: "Hourly limit reached. Please try again in an hour." };
  }

  entry.count++;
  entry.lastCall = now;
  return { allowed: true };
}

// ── In-flight dedup cache ────────────────────────────────────
// Prevents identical concurrent requests from hitting the AI twice.
// Key = careerId + level + goalType. TTL = 5 minutes.

interface CacheEntry {
  result:    ReturnType<typeof buildRoadmapFromCache>;
  expiresAt: number;
}
function buildRoadmapFromCache(r: unknown) { return r; }

const responseCache = new Map<string, { promise: Promise<unknown>; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(careerId: string, answers: { level: string; goalType: string }): string {
  return `${careerId}:${answers.level}:${answers.goalType}`;
}

// ── Safe string cast with fallback ───────────────────────────

function safeStr(val: unknown, fallback = ""): string {
  if (typeof val === "string") return val.slice(0, 5000);
  return fallback;
}

function safeArr<T>(val: unknown): T[] {
  return Array.isArray(val) ? (val as T[]) : [];
}

function safeNum(val: unknown, fallback: number): number {
  const n = Number(val);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : fallback;
}

// ── POST Handler ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── Rate limit ────────────────────────────────────────────
    const rawIp = req.headers.get("x-forwarded-for")
      ?? req.headers.get("x-real-ip")
      ?? "unknown";
    const ip = rawIp.split(",")[0].trim().slice(0, 45); // normalise, limit length

    const rl = checkRateLimit(ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: rl.reason },
        { status: 429, headers: { "Retry-After": "3600" } }
      );
    }

    // ── Body size guard ───────────────────────────────────────
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > 8_000) {
      return NextResponse.json(
        { success: false, error: "Request payload too large." },
        { status: 413 }
      );
    }

    // ── Parse & validate ──────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request: " + parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const { careerId, careerLabel, answers } = parsed.data;

    // ── Generate ──────────────────────────────────────────────
    const careerData = getCareerById(careerId);

    // In-flight dedup: reuse pending promise for identical concurrent requests
    const cacheKey = getCacheKey(careerId, answers);
    const now      = Date.now();
    const cached   = responseCache.get(cacheKey);
    let   resultPromise: Promise<unknown>;

    if (cached && cached.expiresAt > now) {
      resultPromise = cached.promise;
    } else {
      resultPromise = generateRoadmapAdvice(careerId, careerLabel, answers);
      responseCache.set(cacheKey, { promise: resultPromise, expiresAt: now + CACHE_TTL });
      // Auto-evict on failure so next request retries fresh
      resultPromise.catch(() => responseCache.delete(cacheKey));
    }

    const result = await resultPromise as Awaited<ReturnType<typeof generateRoadmapAdvice>>;

    // ── Build hardened response ───────────────────────────────
    const roadmap: GeneratedRoadmap = {
      id:           nanoid(16),
      careerId,
      careerLabel:  safeStr(careerLabel).slice(0, 120),
      careerIcon:   careerData?.icon ?? "🎯",
      answers,
      aiProvider:   result.provider,
      generatedAt:  new Date().toISOString(),
      isPublic:     false,
      progress:     0,
      milestones:   [],

      careerOverview:   safeStr(result.data.careerOverview),
      whyThisCareer:    safeStr(result.data.whyThisCareer),
      marketDemand:     safeStr(result.data.marketDemand),
      aiProofAdvice:    safeStr(result.data.aiProofAdvice),

      beginnerSkills:     safeArr(result.data.beginnerSkills),
      intermediateSkills: safeArr(result.data.intermediateSkills),
      advancedSkills:     safeArr(result.data.advancedSkills),
      futureProofSkills:  safeArr(result.data.futureProofSkills),

      coreTools:          safeArr(result.data.coreTools),
      phases:             safeArr(result.data.phases),
      projects:           safeArr(result.data.projects),
      certifications:     safeArr(result.data.certifications).length
        ? safeArr(result.data.certifications)
        : (careerData?.certifications ?? []),

      salaryProjections:    safeArr(result.data.salaryProjections),
      salaryInsights:       safeStr(result.data.salaryInsights),

      jobRoles:             safeArr(result.data.jobRoles),
      freelanceOpportunities: safeStr(result.data.freelanceOpportunities),
      startupIdeas:         safeArr(result.data.startupIdeas),
      backupCareers:        safeArr(result.data.backupCareers).length
        ? safeArr(result.data.backupCareers)
        : (careerData?.relatedCareers ?? []),

      internshipStrategy: safeStr(result.data.internshipStrategy),
      interviewPrep:      (result.data.interviewPrep as GeneratedRoadmap["interviewPrep"]) ?? {
        commonQuestions: [], codingTopics: [], systemDesign: [],
        behavioural: [], resources: [], timeline: "4–6 weeks",
      },
      commonMistakes: safeArr(result.data.commonMistakes),

      sevenDayPlan:   safeArr(result.data.sevenDayPlan),
      thirtyDayPlan:  safeArr(result.data.thirtyDayPlan),
      ninetyDayPlan:  safeArr(result.data.ninetyDayPlan),

      learningResources: safeArr(result.data.learningResources),
      cityOpportunities: safeStr(result.data.cityOpportunities),

      confidenceScore:        safeNum(result.data.confidenceScore,        calculateConfidenceScore(answers)),
      timeToJobEstimate:      safeStr(result.data.timeToJobEstimate) || estimateTimeToJob(answers.level, answers.timePerDay),
      resumeReadinessScore:   safeNum(result.data.resumeReadinessScore,   30),
      interviewReadinessScore:safeNum(result.data.interviewReadinessScore, 25),
    };

    return NextResponse.json(
      { success: true, roadmap, provider: result.provider, cached: result.cached },
      { status: 200 }
    );

  } catch (err) {
    console.error("[generate-roadmap]", err instanceof Error ? err.message : err);
    // Never expose internal error details to client
    return NextResponse.json(
      { success: false, error: "Failed to generate roadmap. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const hasProvider = !!(
    process.env.GROQ_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.OPENAI_API_KEY
  );
  const primaryProvider =
    process.env.GROQ_API_KEY    ? "groq"      :
    process.env.GEMINI_API_KEY  ? "gemini"    :
    process.env.ANTHROPIC_API_KEY ? "anthropic" :
    process.env.OPENAI_API_KEY  ? "openai"    : "template";
  return NextResponse.json({
    status: "CareerPath AI roadmap endpoint active",
    aiReady: hasProvider,
    mode: hasProvider ? "ai" : "template",
    primaryProvider,
  });
}
