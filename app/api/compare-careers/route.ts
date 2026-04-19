// ============================================================
// app/api/compare-careers/route.ts — Hardened
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { compareCareerAdvice } from "@/lib/ai-advisor";

const RequestSchema = z.object({
  careerA:     z.string().min(1).max(120),
  careerB:     z.string().min(1).max(120),
  userContext: z.record(z.string().max(200)).optional(),
});

// Shared simple rate limiter (same pattern as generate-roadmap)
const rlStore = new Map<string, { count: number; resetAt: number; lastCall: number }>();

function checkRL(ip: string): boolean {
  const now = Date.now();
  const e   = rlStore.get(ip);
  if (!e || e.resetAt < now) {
    rlStore.set(ip, { count: 1, resetAt: now + 3_600_000, lastCall: now });
    return true;
  }
  if (now - e.lastCall < 5_000) return false;   // 5 s burst guard
  if (e.count >= 10) return false;              // 10 comparisons/hour
  e.count++;
  e.lastCall = now;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
    if (!checkRL(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait before comparing again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    let body: unknown;
    try { body = await req.json(); }
    catch { return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 }); }

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request: " + parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const { careerA, careerB } = parsed.data;

    // Prevent identical-career comparison (wasteful API call)
    if (careerA.trim().toLowerCase() === careerB.trim().toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Please choose two different careers to compare." },
        { status: 400 }
      );
    }

    const rawResult = await compareCareerAdvice(careerA, careerB);

    // Extract JSON safely
    const start = rawResult.indexOf("{");
    const end   = rawResult.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No valid JSON in AI response");

    const result = JSON.parse(rawResult.slice(start, end + 1));

    return NextResponse.json({ success: true, result });

  } catch (err) {
    console.error("[compare-careers]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: "Comparison failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "CareerPath AI compare endpoint active" });
}
