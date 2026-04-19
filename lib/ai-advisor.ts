// ============================================================
// lib/ai-advisor.ts
// Provider chain: Groq (primary) → Gemini 2.5 Flash (fallback)
//                 → Anthropic (legacy) → OpenAI (legacy)
//                 → Template (always works, no API needed)
//
// SERVER-SIDE ONLY — never imported by client components.
// ============================================================

import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeneratedRoadmap, UserAnswers, AIProvider } from "@/types";
import { getTemplate } from "@/data/templates";
import { buildRoadmapFromTemplate } from "@/lib/roadmap-engine/template-builder";

// ── Lazy client singletons ────────────────────────────────────

let _groq: Groq | null = null;
let _gemini: GoogleGenerativeAI | null = null;

function getGroq(): Groq {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  return _groq;
}

function getGemini(): GoogleGenerativeAI {
  if (!_gemini) _gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  return _gemini;
}

// ── Input sanitizer (anti-prompt-injection) ───────────────────

function sanitize(input: string, maxLen = 200): string {
  return String(input ?? "")
    .replace(/[<>{}[\]\\]/g, "")
    .replace(/\b(ignore|forget|pretend|bypass|jailbreak|system prompt|disregard)\b/gi, "")
    .slice(0, maxLen)
    .trim();
}

// ── Token-optimised prompt (free-tier friendly) ───────────────
// Kept short to stay well within Groq free limits (~6K tokens output).
// System prompt is minimal; JSON schema is concise but complete.

function buildSystemPrompt(): string {
  return "You are CareerPath AI India — an expert career advisor for Indian students and professionals. Return ONLY valid JSON, no prose, no markdown fences.";
}

function buildUserPrompt(careerLabel: string, answers: UserAnswers, ctx?: string): string {
  const career  = sanitize(careerLabel, 100);
  const edu     = sanitize(answers.education, 120);
  const level   = sanitize(answers.level, 30);
  const time    = sanitize(answers.timePerDay, 50);
  const budget  = sanitize(answers.budget, 80);
  const salary  = sanitize(answers.targetSalary, 80);
  const goal    = sanitize(answers.goalType, 30);
  const city    = sanitize(answers.city, 60);
  const motive  = sanitize(answers.motivation ?? "", 300);

  return `Career: ${career}
Education: ${edu} | Level: ${level} | Time/day: ${time}
Budget: ${budget} | Target salary: ${salary}
Goal: ${goal} | City: ${city}
Context: ${motive || "none"}${ctx ? `\nSkills context: ${ctx}` : ""}

Return this JSON (India-specific, actionable, real data):
{
  "careerOverview":"2-3 sentences for this user's level",
  "whyThisCareer":"3 India-specific reasons, 2024-25",
  "marketDemand":"demand analysis India 2024-25",
  "aiProofAdvice":"skills to stay relevant with AI",
  "beginnerSkills":["s1","s2","s3","s4","s5"],
  "intermediateSkills":["s1","s2","s3","s4","s5"],
  "advancedSkills":["s1","s2","s3","s4"],
  "futureProofSkills":["s1","s2","s3"],
  "coreTools":[{"name":"t","category":"c","difficulty":"beginner","free":true,"description":"why","priority":1}],
  "phases":[
    {"id":"phase-1","title":"t","duration":"X weeks","skills":["s1"],"projects":["p1"],"milestones":["m1"],"resources":[{"title":"r","platform":"p","cost":"Free","duration":"X weeks","type":"course","free":true,"rating":9}]}
  ],
  "projects":[{"title":"t","description":"d","difficulty":"beginner","skills":["s1"],"timeEstimate":"X weeks","portfolioImpact":8}],
  "certifications":[{"name":"n","provider":"p","cost":"Free","duration":"X months","roiScore":9,"free":true}],
  "salaryProjections":[
    {"year":0,"label":"Fresher","minSalary":4,"maxSalary":7,"role":"Junior"},
    {"year":2,"label":"2 Years","minSalary":8,"maxSalary":14,"role":"Mid"},
    {"year":5,"label":"5 Years","minSalary":18,"maxSalary":32,"role":"Senior"},
    {"year":8,"label":"8 Years","minSalary":30,"maxSalary":55,"role":"Lead"}
  ],
  "salaryInsights":"India salary by city and company type",
  "jobRoles":["r1","r2","r3","r4"],
  "freelanceOpportunities":"platforms, ₹ rates, first client strategy India",
  "startupIdeas":["i1","i2","i3"],
  "backupCareers":["c1","c2","c3"],
  "internshipStrategy":"step-by-step India internship guide",
  "interviewPrep":{"commonQuestions":["q1","q2","q3"],"codingTopics":["t1","t2"],"systemDesign":["t1"],"behavioural":["q1"],"resources":["r1"],"timeline":"4-6 week plan"},
  "commonMistakes":["m1","m2","m3","m4","m5"],
  "sevenDayPlan":[
    {"day":1,"title":"t","tasks":["t1","t2"],"timeRequired":"2 hours","goal":"outcome"},
    {"day":2,"title":"t","tasks":["t1"],"timeRequired":"2 hours","goal":"outcome"},
    {"day":3,"title":"t","tasks":["t1"],"timeRequired":"2 hours","goal":"outcome"},
    {"day":4,"title":"t","tasks":["t1"],"timeRequired":"2 hours","goal":"outcome"},
    {"day":5,"title":"t","tasks":["t1"],"timeRequired":"2 hours","goal":"outcome"},
    {"day":6,"title":"t","tasks":["t1"],"timeRequired":"2 hours","goal":"outcome"},
    {"day":7,"title":"t","tasks":["t1"],"timeRequired":"1 hour","goal":"outcome"}
  ],
  "thirtyDayPlan":[
    {"week":1,"theme":"t","goals":["g1","g2"],"deliverable":"d"},
    {"week":2,"theme":"t","goals":["g1","g2"],"deliverable":"d"},
    {"week":3,"theme":"t","goals":["g1","g2"],"deliverable":"d"},
    {"week":4,"theme":"t","goals":["g1","g2"],"deliverable":"d"}
  ],
  "ninetyDayPlan":[
    {"month":1,"theme":"t","milestones":["m1","m2","m3"],"successMetric":"how to know"},
    {"month":2,"theme":"t","milestones":["m1","m2","m3"],"successMetric":"how to know"},
    {"month":3,"theme":"t","milestones":["m1","m2","m3"],"successMetric":"how to know"}
  ],
  "learningResources":[{"title":"r","platform":"p","url":"https://example.com","cost":"Free","duration":"X weeks","type":"course","free":true}],
  "cityOpportunities":"Bangalore Mumbai Delhi Hyderabad Pune Chennai salaries",
  "confidenceScore":82,
  "timeToJobEstimate":"8-12 months",
  "resumeReadinessScore":35,
  "interviewReadinessScore":25
}`;
}

// ── Robust JSON extractor (survives markdown fences + trailing commas) ──

function extractJSON(raw: string): Record<string, unknown> {
  if (!raw || typeof raw !== "string") throw new Error("Empty AI response");

  const cleaned = raw
    .replace(/^```(?:json)?\s*/gm, "")
    .replace(/```\s*$/gm, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end   = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object in response");

  const slice = cleaned.slice(start, end + 1);

  // First attempt — direct parse
  try { return JSON.parse(slice) as Record<string, unknown>; } catch (e1) {
    // Recovery — strip trailing commas
    const recovered = slice
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/([{[,])\s*,/g, "$1");
    try { return JSON.parse(recovered) as Record<string, unknown>; }
    catch { throw new Error(`JSON parse failed: ${e1 instanceof Error ? e1.message : e1}`); }
  }
}

// ── Provider: Groq ────────────────────────────────────────────
// Free tier: ~14,400 req/day on llama-3.3-70b-versatile (as of 2025)

async function runGroq(
  careerLabel: string,
  answers: UserAnswers,
  ctx?: string
): Promise<string> {
  const client = getGroq();
  const system = buildSystemPrompt();
  const user   = buildUserPrompt(careerLabel, answers, ctx);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await client.chat.completions.create({
        model:       "llama-3.3-70b-versatile",
        max_tokens:  5000,
        temperature: 0.4,   // lower = more deterministic JSON
        messages: [
          { role: "system", content: system },
          { role: "user",   content: user },
        ],
      });
      const text = res.choices[0]?.message?.content ?? "";
      if (!text) throw new Error("Empty content from Groq");
      return text;
    } catch (err) {
      const isRateLimit = err instanceof Error &&
        (err.message.includes("429") || err.message.toLowerCase().includes("rate limit"));
      // Don't retry rate limit errors — fall through to next provider immediately
      if (isRateLimit) throw err;
      if (attempt === 1) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("Groq: retries exhausted");
}

// ── Provider: Gemini 2.5 Flash ────────────────────────────────
// Free tier: 1,500 req/day, 1M tokens/min (as of 2025)

async function runGemini(
  careerLabel: string,
  answers: UserAnswers,
  ctx?: string
): Promise<string> {
  const genAI  = getGemini();
  const model  = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",          // stable alias for gemini-2.0-flash-exp / flash
    generationConfig: {
      maxOutputTokens: 5000,
      temperature:     0.4,
      responseMimeType: "application/json",   // forces JSON output natively
    },
  });

  const system = buildSystemPrompt();
  const user   = buildUserPrompt(careerLabel, answers, ctx);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await model.generateContent(`${system}\n\n${user}`);
      const text   = result.response.text();
      if (!text) throw new Error("Empty content from Gemini");
      return text;
    } catch (err) {
      const isQuota = err instanceof Error &&
        (err.message.includes("429") || err.message.toLowerCase().includes("quota"));
      if (isQuota) throw err;   // no retry on quota — fall through immediately
      if (attempt === 1) throw err;
      await new Promise((r) => setTimeout(r, 1200));
    }
  }
  throw new Error("Gemini: retries exhausted");
}

// ── Provider: Anthropic (legacy / optional) ───────────────────

async function runAnthropic(
  careerLabel: string,
  answers: UserAnswers,
  ctx?: string
): Promise<string> {
  // Dynamic import — only runs if ANTHROPIC_API_KEY is set
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const prompt = `${buildSystemPrompt()}\n\n${buildUserPrompt(careerLabel, answers, ctx)}`;

  const msg = await client.messages.create({
    model:      "claude-sonnet-4-5",
    max_tokens: 5000,
    messages:   [{ role: "user", content: prompt }],
  });
  const block = msg.content.find((c) => c.type === "text");
  if (block?.type === "text") return block.text;
  throw new Error("Anthropic: no text block");
}

// ── Provider: OpenAI (legacy / optional) ─────────────────────

async function runOpenAI(
  careerLabel: string,
  answers: UserAnswers,
  ctx?: string
): Promise<string> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const res = await client.chat.completions.create({
    model:           "gpt-4o-mini",   // cheaper than gpt-4o, still capable
    max_tokens:      5000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user",   content: buildUserPrompt(careerLabel, answers, ctx) },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}

// ── Main advisor entry point ──────────────────────────────────

export interface AdvisorResult {
  data:           Partial<GeneratedRoadmap>;
  provider:       AIProvider;
  cached:         boolean;
  generationTime: number;
}

export async function generateRoadmapAdvice(
  careerId:    string,
  careerLabel: string,
  answers:     UserAnswers
): Promise<AdvisorResult> {
  const t0 = Date.now();

  // Template context hint for AI (never exposes secrets)
  const template = getTemplate(careerId);
  const ctx = template
    ? `Known skills: ${[...template.beginnerSkills, ...template.intermediateSkills].slice(0, 10).join(", ")}.`
    : undefined;

  // ── Provider waterfall ────────────────────────────────────
  // Order: Groq → Gemini → Anthropic → OpenAI → Template
  // Each step only runs if the required API key is present.
  // 429 / quota errors skip to next provider without retry.

  const chain: { name: AIProvider; envKey: string; fn: () => Promise<string> }[] = [
    { name: "groq",      envKey: "GROQ_API_KEY",      fn: () => runGroq(careerLabel, answers, ctx) },
    { name: "gemini",    envKey: "GEMINI_API_KEY",     fn: () => runGemini(careerLabel, answers, ctx) },
    { name: "anthropic", envKey: "ANTHROPIC_API_KEY",  fn: () => runAnthropic(careerLabel, answers, ctx) },
    { name: "openai",    envKey: "OPENAI_API_KEY",     fn: () => runOpenAI(careerLabel, answers, ctx) },
  ];

  let lastErr: Error | null = null;

  for (const { name, envKey, fn } of chain) {
    if (!process.env[envKey]) continue;   // skip if key not configured

    try {
      const raw  = await fn();
      const data = extractJSON(raw);
      return {
        data:           data as Partial<GeneratedRoadmap>,
        provider:       name,
        cached:         false,
        generationTime: Date.now() - t0,
      };
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      console.error(`[ai-advisor] ${name} failed:`, lastErr.message);
      // Continue to next provider
    }
  }

  // ── Template fallback — ALWAYS works, no API needed ───────
  if (template) {
    console.warn("[ai-advisor] All AI providers failed — serving template roadmap");
    const data = buildRoadmapFromTemplate(template, answers);
    return {
      data:           data as Partial<GeneratedRoadmap>,
      provider:       "template",
      cached:         false,
      generationTime: Date.now() - t0,
    };
  }

  // No template + no provider = safe partial fallback (never crash)
  console.error("[ai-advisor] No providers and no template — returning empty shell");
  return {
    data: {
      careerOverview:   "Roadmap generation is currently unavailable. Please try again shortly.",
      beginnerSkills:   [],
      phases:           [],
      projects:         [],
      salaryProjections:[],
      sevenDayPlan:     [],
      thirtyDayPlan:    [],
      ninetyDayPlan:    [],
      confidenceScore:  0,
      timeToJobEstimate:"Unknown",
    },
    provider:       "template",
    cached:         false,
    generationTime: Date.now() - t0,
  };
}

// ── Career comparison (Groq → Gemini → Anthropic fallback) ───

export async function compareCareerAdvice(
  careerA: string,
  careerB: string
): Promise<string> {
  const cA = sanitize(careerA, 100);
  const cB = sanitize(careerB, 100);

  const prompt = `Compare these two careers for Indian job market 2024-25.
Career A: ${cA}
Career B: ${cB}
Return ONLY valid JSON:
{"careerA":"${cA}","careerB":"${cB}","winner":"better career name","comparison":[{"metric":"Starting Salary (India)","careerA":"₹X-Y LPA","careerB":"₹X-Y LPA","winner":"A"},{"metric":"Time to first job","careerA":"X months","careerB":"X months","winner":"B"},{"metric":"Job demand","careerA":"X/100","careerB":"X/100","winner":"A"},{"metric":"Freelance potential","careerA":"High","careerB":"Medium","winner":"A"},{"metric":"Remote work","careerA":"High","careerB":"Medium","winner":"A"},{"metric":"AI disruption risk","careerA":"Low","careerB":"Medium","winner":"A"},{"metric":"Difficulty","careerA":"Medium","careerB":"Hard","winner":"A"},{"metric":"5-yr ceiling","careerA":"₹X LPA","careerB":"₹X LPA","winner":"B"}],"recommendation":"2 paragraphs for Indian students","verdict":"one sentence"}`;

  const compareChain: { envKey: string; fn: () => Promise<string> }[] = [
    {
      envKey: "GROQ_API_KEY",
      fn: async () => {
        const res = await getGroq().chat.completions.create({
          model: "llama-3.3-70b-versatile", max_tokens: 1200, temperature: 0.3,
          messages: [
            { role: "system", content: "Return only valid JSON." },
            { role: "user",   content: prompt },
          ],
        });
        return res.choices[0]?.message?.content ?? "";
      },
    },
    {
      envKey: "GEMINI_API_KEY",
      fn: async () => {
        const model = getGemini().getGenerativeModel({
          model: "gemini-2.0-flash",
          generationConfig: { maxOutputTokens: 1200, temperature: 0.3, responseMimeType: "application/json" },
        });
        const r = await model.generateContent(prompt);
        return r.response.text();
      },
    },
    {
      envKey: "ANTHROPIC_API_KEY",
      fn: async () => {
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
        const msg = await client.messages.create({
          model: "claude-sonnet-4-5", max_tokens: 1200,
          messages: [{ role: "user", content: prompt }],
        });
        const block = msg.content.find((c) => c.type === "text");
        return block?.type === "text" ? block.text : "{}";
      },
    },
  ];

  for (const { envKey, fn } of compareChain) {
    if (!process.env[envKey]) continue;
    try { return await fn(); } catch (err) {
      console.error(`[compare] ${envKey} failed:`, err instanceof Error ? err.message : err);
    }
  }

  // Minimal safe fallback comparison
  return JSON.stringify({
    careerA: cA, careerB: cB, winner: cA,
    comparison: [], recommendation: "Comparison unavailable. Please try again.",
    verdict: "Unable to compare at this time.",
  });
}

// ── Streaming (Groq primary, no fallback for streaming) ───────

export async function generateRoadmapStream(
  careerLabel: string,
  answers:     UserAnswers
): Promise<ReadableStream<Uint8Array>> {
  const system = buildSystemPrompt();
  const user   = buildUserPrompt(careerLabel, answers);

  if (process.env.GROQ_API_KEY) {
    const stream = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile", max_tokens: 5000, stream: true,
      messages: [
        { role: "system", content: system },
        { role: "user",   content: user },
      ],
    });

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) { controller.error(err); }
      },
    });
  }

  // Gemini streaming fallback
  if (process.env.GEMINI_API_KEY) {
    const model  = getGemini().getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContentStream(`${system}\n\n${user}`);

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) { controller.error(err); }
      },
    });
  }

  throw new Error("No provider available for streaming");
}
