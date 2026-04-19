// ============================================================
// lib/recommendation-engine/index.ts
// Recommends next skills, courses, and career alternatives
// ============================================================

import { CAREERS_DATA } from "@/data/careers";
import type { GeneratedRoadmap, UserAnswers, CareerData } from "@/types";

// ── Skill Gap Detector ────────────────────────────────────────

export function detectSkillGaps(
  currentSkills: string[],
  requiredSkills: string[]
): { missing: string[]; partial: string[]; strong: string[] } {
  const normalizedCurrent = currentSkills.map((s) => s.toLowerCase().trim());

  const missing: string[] = [];
  const partial: string[] = [];
  const strong: string[] = [];

  for (const skill of requiredSkills) {
    const norm = skill.toLowerCase().trim();
    const exact = normalizedCurrent.includes(norm);
    const similar = normalizedCurrent.some(
      (cs) => cs.includes(norm.split(" ")[0]) || norm.includes(cs.split(" ")[0])
    );

    if (exact) strong.push(skill);
    else if (similar) partial.push(skill);
    else missing.push(skill);
  }

  return { missing, partial, strong };
}

// ── Next Best Skill Recommender ───────────────────────────────

export function recommendNextSkills(
  roadmap: Partial<GeneratedRoadmap>,
  completedMilestoneIds: string[]
): string[] {
  const completedPhases = (roadmap.phases ?? []).filter((p) =>
    p.milestones.every((m) => completedMilestoneIds.includes(m))
  );

  const nextPhaseIdx = completedPhases.length;
  const nextPhase = roadmap.phases?.[nextPhaseIdx];

  if (!nextPhase) return roadmap.advancedSkills?.slice(0, 5) ?? [];
  return nextPhase.skills.slice(0, 5);
}

// ── Career Alternatives ───────────────────────────────────────

export function getCareerAlternatives(
  careerId: string,
  goalType: string,
  salaryTarget: string
): CareerData[] {
  const career = CAREERS_DATA.find((c) => c.id === careerId);
  if (!career) return [];

  const related = career.relatedCareers
    .map((id) => CAREERS_DATA.find((c) => c.id === id))
    .filter(Boolean) as CareerData[];

  // Also find careers by salary compatibility
  const salaryCompatible = CAREERS_DATA.filter(
    (c) =>
      c.id !== careerId &&
      c.categoryId === career.categoryId &&
      c.aiRiskLevel !== "high" &&
      !related.find((r) => r.id === c.id)
  ).slice(0, 2);

  return [...related, ...salaryCompatible].slice(0, 4);
}

// ── Course Priority Ranker ────────────────────────────────────

export function rankCoursesByPriority(
  resources: GeneratedRoadmap["phases"][0]["resources"],
  budget: string,
  timePerDay: string
): GeneratedRoadmap["phases"][0]["resources"] {
  const isFreeOnly = budget.includes("₹0") || budget.toLowerCase().includes("free only");
  const hasLimitedTime = timePerDay.includes("Less than") || timePerDay.includes("1–2");

  return [...resources]
    .filter((r) => (isFreeOnly ? r.free : true))
    .sort((a, b) => {
      // Prioritize free resources first if budget constrained
      if (isFreeOnly) {
        if (a.free && !b.free) return -1;
        if (!a.free && b.free) return 1;
      }
      // Then by rating
      return (b.rating ?? 7) - (a.rating ?? 7);
    })
    .slice(0, hasLimitedTime ? 3 : 5);
}

// ── Confidence Score ──────────────────────────────────────────

export function calculateConfidenceScore(answers: UserAnswers): number {
  let score = 50; // Base score

  // More time = higher confidence
  if (answers.timePerDay.includes("4–6") || answers.timePerDay.includes("6+")) score += 20;
  else if (answers.timePerDay.includes("2–4")) score += 10;

  // Higher level = higher confidence
  if (answers.level === "intermediate") score += 15;
  else if (answers.level === "advanced") score += 25;

  // Budget available = higher confidence
  if (answers.budget.includes("₹5,000") || answers.budget.includes("₹15,000+")) score += 10;
  else if (answers.budget.includes("₹1,500")) score += 5;

  // Specific goal = higher confidence
  if (answers.goalType && answers.goalType !== "") score += 5;

  return Math.min(score, 95); // Cap at 95
}

// ── Resume Readiness ──────────────────────────────────────────

export function estimateResumeReadiness(
  level: string,
  hasProjects: boolean,
  hasInternship: boolean
): number {
  let score = 10;
  if (level === "intermediate") score += 20;
  if (level === "advanced") score += 40;
  if (hasProjects) score += 25;
  if (hasInternship) score += 20;
  return Math.min(score, 90);
}
