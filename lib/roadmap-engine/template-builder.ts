// ============================================================
// lib/roadmap-engine/template-builder.ts
// Builds a GeneratedRoadmap from a prebuilt template + user answers
// Used as fallback when AI is unavailable
// ============================================================

import { nanoid } from "nanoid";
import type { GeneratedRoadmap, UserAnswers, Milestone } from "@/types";
import type { RoadmapTemplate } from "@/data/templates";

export function buildRoadmapFromTemplate(
  template: RoadmapTemplate,
  answers: UserAnswers
): Partial<GeneratedRoadmap> {
  const milestones: Milestone[] = [
    ...template.phases.flatMap((p) =>
      p.milestones.map((m) => ({
        id: nanoid(8),
        label: m,
        xpReward: 50,
        completed: false,
      }))
    ),
  ];

  return {
    careerId: template.careerId,
    answers,
    beginnerSkills: template.beginnerSkills,
    intermediateSkills: template.intermediateSkills,
    advancedSkills: template.advancedSkills,
    futureProofSkills: template.futureProofSkills,
    phases: template.phases,
    projects: template.projects,
    certifications: [], // Would need to be fetched from career data
    salaryProjections: template.salaryProjections,
    sevenDayPlan: template.sevenDayPlan,
    thirtyDayPlan: template.thirtyDayPlan,
    ninetyDayPlan: template.ninetyDayPlan,
    commonMistakes: template.commonMistakes,
    backupCareers: template.backupCareers,
    startupIdeas: template.startupIdeas,
    milestones,
    progress: 0,
    confidenceScore: 75, // Template-based, not AI-personalized
    resumeReadinessScore: 30,
    interviewReadinessScore: 25,
  };
}

// ── Milestone Generator ───────────────────────────────────────

export function generateDefaultMilestones(phases: GeneratedRoadmap["phases"]): Milestone[] {
  return phases.flatMap((phase) =>
    phase.milestones.map((m) => ({
      id: nanoid(8),
      label: m,
      description: `Part of ${phase.title}`,
      xpReward: 50,
      completed: false,
    }))
  );
}

// ── Progress Calculator ───────────────────────────────────────

export function calculateProgress(milestones: Milestone[]): number {
  if (!milestones.length) return 0;
  const completed = milestones.filter((m) => m.completed).length;
  return Math.round((completed / milestones.length) * 100);
}

// ── XP Calculator ─────────────────────────────────────────────

export function calculateXP(milestones: Milestone[]): number {
  return milestones
    .filter((m) => m.completed)
    .reduce((sum, m) => sum + (m.xpReward ?? 50), 0);
}

// ── Time Estimator ────────────────────────────────────────────

export function estimateTimeToJob(
  level: string,
  timePerDay: string
): string {
  const hoursPerDay = parseTimeToHours(timePerDay);
  const baseWeeks = getBaseWeeks(level);
  const adjustedWeeks = Math.ceil(baseWeeks / hoursPerDay);

  const months = Math.ceil(adjustedWeeks / 4);
  const maxMonths = months + 3;

  return `${months}–${maxMonths} months`;
}

function parseTimeToHours(timeStr: string): number {
  if (timeStr.includes("1 hour") || timeStr.includes("Less than")) return 1;
  if (timeStr.includes("1–2")) return 1.5;
  if (timeStr.includes("2–4")) return 3;
  if (timeStr.includes("4–6")) return 5;
  if (timeStr.includes("6+")) return 7;
  return 2;
}

function getBaseWeeks(level: string): number {
  if (level.toLowerCase().includes("beginner")) return 48; // 2 hrs/day baseline
  if (level.toLowerCase().includes("basic")) return 36;
  if (level.toLowerCase().includes("intermediate")) return 20;
  if (level.toLowerCase().includes("advanced")) return 10;
  return 36;
}
