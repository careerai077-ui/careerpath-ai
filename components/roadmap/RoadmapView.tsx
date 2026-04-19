// ============================================================
// components/roadmap/RoadmapView.tsx
// ============================================================

"use client";

import React, { useState } from "react";
import type { GeneratedRoadmap } from "@/types";
import {
  Button, Badge, GlassCard, ProgressBar, StatCard,
  SectionDivider, EmptyState, Spinner
} from "@/components/ui";
import { ProgressTracker } from "./ProgressTracker";
import { SalaryChart } from "./SalaryChart";
import { cn, formatDate } from "@/utils";
import toast from "react-hot-toast";

interface RoadmapViewProps {
  roadmap: GeneratedRoadmap;
  onSave: (r: GeneratedRoadmap) => void;
  onBack: () => void;
}

type TabId =
  | "overview"
  | "roadmap"
  | "skills"
  | "projects"
  | "salary"
  | "jobs"
  | "action"
  | "tracker";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "🎯" },
  { id: "roadmap", label: "Roadmap", icon: "🗺️" },
  { id: "skills", label: "Skills & Tools", icon: "🛠️" },
  { id: "projects", label: "Projects", icon: "💼" },
  { id: "salary", label: "Salary", icon: "💰" },
  { id: "jobs", label: "Jobs & Internships", icon: "👔" },
  { id: "action", label: "Action Plans", icon: "📅" },
  { id: "tracker", label: "Tracker", icon: "✅" },
];

export function RoadmapView({ roadmap, onSave, onBack }: RoadmapViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(roadmap);
    setSaved(true);
    toast.success("Roadmap saved to dashboard!");
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownload = () => {
    const content = buildDownloadText(roadmap);
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${roadmap.careerLabel.replace(/\s+/g, "-").toLowerCase()}-roadmap.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Roadmap downloaded!");
  };

  const handleShare = () => {
    const url = `${window.location.origin}/roadmap/${roadmap.id}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Link copied to clipboard!"));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-4 mb-8">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1.5 transition-colors mt-1">
          ← Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="text-3xl">{roadmap.careerIcon}</span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl">{roadmap.careerLabel}</h1>
            <Badge variant="brand">{roadmap.answers.goalType}</Badge>
            {roadmap.aiProvider !== "template" && (
              <Badge variant="green" dot>AI Generated</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>{roadmap.answers.education}</span>
            <span className="text-border">·</span>
            <span>{roadmap.answers.level}</span>
            <span className="text-border">·</span>
            <span>{roadmap.answers.timePerDay}</span>
            <span className="text-border">·</span>
            <span>Generated {formatDate(roadmap.generatedAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="secondary" size="sm" onClick={handleDownload}>
            ⬇ Download
          </Button>
          <Button variant="secondary" size="sm" onClick={handleShare}>
            🔗 Share
          </Button>
          <Button variant={saved ? "gold" : "primary"} size="sm" onClick={handleSave}>
            {saved ? "✓ Saved" : "💾 Save"}
          </Button>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard icon="🎯" label="Confidence" value={`${roadmap.confidenceScore}%`} variant="brand" />
        <StatCard icon="⏱️" label="Time to Job" value={roadmap.timeToJobEstimate} sub="Estimated" variant="gold" />
        <StatCard icon="📄" label="Resume Score" value={`${roadmap.resumeReadinessScore}%`} variant="green" />
        <StatCard icon="🎤" label="Interview Score" value={`${roadmap.interviewReadinessScore}%`} variant="brand" />
      </div>

      {/* Tabs */}
      <div className="tab-scroll mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0",
              activeTab === tab.id
                ? "bg-brand-500/12 text-brand-300 border border-brand-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-white/4"
            )}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <GlassCard className="p-6 sm:p-8 min-h-[400px]">
        {activeTab === "overview" && <OverviewTab roadmap={roadmap} />}
        {activeTab === "roadmap" && <RoadmapTab roadmap={roadmap} />}
        {activeTab === "skills" && <SkillsTab roadmap={roadmap} />}
        {activeTab === "projects" && <ProjectsTab roadmap={roadmap} />}
        {activeTab === "salary" && <SalaryTab roadmap={roadmap} />}
        {activeTab === "jobs" && <JobsTab roadmap={roadmap} />}
        {activeTab === "action" && <ActionTab roadmap={roadmap} />}
        {activeTab === "tracker" && (
          <ProgressTracker roadmap={roadmap} onUpdate={(updated) => onSave(updated)} />
        )}
      </GlassCard>
    </div>
  );
}

// ── Tab: Overview ─────────────────────────────────────────────

function OverviewTab({ roadmap }: { roadmap: GeneratedRoadmap }) {
  return (
    <div className="space-y-6">
      {roadmap.careerOverview && (
        <div>
          <h2 className="font-display font-bold text-lg mb-3">Career Overview</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{roadmap.careerOverview}</p>
        </div>
      )}

      {roadmap.whyThisCareer && (
        <div>
          <SectionDivider label="Why This Career" />
          <p className="text-muted-foreground text-sm leading-relaxed">{roadmap.whyThisCareer}</p>
        </div>
      )}

      {roadmap.marketDemand && (
        <div>
          <SectionDivider label="Market Demand — India 2025" />
          <p className="text-muted-foreground text-sm leading-relaxed">{roadmap.marketDemand}</p>
        </div>
      )}

      {roadmap.aiProofAdvice && (
        <div className="p-5 rounded-xl border border-gold/20 bg-gold/5">
          <div className="flex items-center gap-2 mb-2">
            <span>🤖</span>
            <h3 className="font-display font-semibold text-sm text-gold">AI-Proof Strategy</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{roadmap.aiProofAdvice}</p>
        </div>
      )}

      {roadmap.backupCareers.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider text-xs">
            Backup Career Paths
          </h3>
          <div className="flex flex-wrap gap-2">
            {roadmap.backupCareers.map((c) => (
              <span key={c} className="px-3 py-1.5 rounded-lg bg-white/4 border border-border text-sm text-muted-foreground">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Roadmap ──────────────────────────────────────────────

function RoadmapTab({ roadmap }: { roadmap: GeneratedRoadmap }) {
  if (!roadmap.phases?.length) {
    return <EmptyState icon="🗺️" title="Roadmap phases not generated yet" description="Save and re-generate to get full phase breakdown" />;
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-10 bottom-0 w-px bg-gradient-to-b from-brand-500/50 to-transparent" />

      <div className="space-y-8">
        {roadmap.phases.map((phase, i) => (
          <div key={phase.id} className="flex gap-5">
            {/* Dot */}
            <div className="flex flex-col items-center flex-shrink-0 relative z-10">
              <div className={cn(
                "w-10 h-10 rounded-xl border flex items-center justify-center font-display font-bold text-sm",
                i === 0
                  ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                  : "bg-white/4 border-border text-muted-foreground"
              )}>
                {i + 1}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h3 className="font-display font-bold text-base">{phase.title}</h3>
                <span className="badge-brand inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border">
                  {phase.duration}
                </span>
              </div>

              {phase.skills.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {phase.skills.map((skill) => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg bg-brand-500/8 border border-brand-500/15 text-xs text-brand-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {phase.milestones.length > 0 && (
                <div className="space-y-1.5">
                  {phase.milestones.map((m) => (
                    <div key={m} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-success mt-0.5 flex-shrink-0">✓</span>
                      {m}
                    </div>
                  ))}
                </div>
              )}

              {phase.resources.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {phase.resources.slice(0, 3).map((r, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs">
                      <span className="text-brand-400">📚</span>
                      <span className="text-muted-foreground">
                        <span className="text-foreground">{r.title}</span> — {r.platform}
                      </span>
                      <span className={cn("ml-auto flex-shrink-0", r.free ? "text-success" : "text-gold")}>
                        {r.free ? "Free" : r.cost}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Skills ───────────────────────────────────────────────

function SkillsTab({ roadmap }: { roadmap: GeneratedRoadmap }) {
  const skillGroups = [
    { label: "Beginner", skills: roadmap.beginnerSkills, color: "text-success", bg: "bg-success/8 border-success/20" },
    { label: "Intermediate", skills: roadmap.intermediateSkills, color: "text-brand-300", bg: "bg-brand-500/8 border-brand-500/20" },
    { label: "Advanced", skills: roadmap.advancedSkills, color: "text-gold", bg: "bg-gold/8 border-gold/20" },
    { label: "Future-Proof (AI Era)", skills: roadmap.futureProofSkills, color: "text-violet-300", bg: "bg-violet-500/8 border-violet-500/20" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        {skillGroups.map(({ label, skills, color, bg }) =>
          skills.length > 0 ? (
            <div key={label} className="p-4 rounded-xl border border-border/60 bg-white/2">
              <div className={cn("font-display font-semibold text-sm mb-3", color)}>{label}</div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span key={skill} className={cn("px-2.5 py-1 rounded-lg text-xs border", bg, color)}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>

      {roadmap.coreTools.length > 0 && (
        <>
          <SectionDivider label="Core Tools & Technologies" />
          <div className="grid sm:grid-cols-2 gap-3">
            {roadmap.coreTools.slice(0, 10).map((tool) => (
              <div key={tool.name} className="flex items-start gap-3 p-3 rounded-xl bg-white/2 border border-border/50">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-sm flex-shrink-0">
                  🔧
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium">{tool.name}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-medium",
                      tool.difficulty === "beginner" ? "bg-success/10 text-success" :
                      tool.difficulty === "intermediate" ? "bg-brand-500/10 text-brand-400" :
                      "bg-gold/10 text-gold"
                    )}>
                      {tool.difficulty}
                    </span>
                    {tool.free && <span className="text-[10px] text-success">Free</span>}
                  </div>
                  {tool.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Tab: Projects ─────────────────────────────────────────────

function ProjectsTab({ roadmap }: { roadmap: GeneratedRoadmap }) {
  if (!roadmap.projects?.length) {
    return <EmptyState icon="💼" title="No projects generated" description="Re-generate your roadmap for project ideas" />;
  }

  const difficultyConfig = {
    beginner: { label: "Beginner", color: "text-success", bg: "bg-success/8 border-success/20" },
    intermediate: { label: "Intermediate", color: "text-brand-300", bg: "bg-brand-500/8 border-brand-500/20" },
    advanced: { label: "Advanced", color: "text-gold", bg: "bg-gold/8 border-gold/20" },
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Build these projects in order — they showcase your skills progression and impress recruiters.
      </p>
      {roadmap.projects.map((project, i) => {
        const diff = difficultyConfig[project.difficulty];
        return (
          <div key={i} className="p-5 rounded-xl border border-border/60 bg-white/2 hover:border-brand-500/30 transition-colors">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">#{i + 1}</span>
                <h3 className="font-display font-semibold">{project.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs px-2.5 py-1 rounded-lg border", diff.bg, diff.color)}>
                  {diff.label}
                </span>
                <span className="text-xs text-muted-foreground">{project.timeEstimate}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {project.skills.map((skill) => (
                <span key={skill} className="text-xs px-2 py-1 rounded bg-white/4 border border-border text-muted-foreground">
                  {skill}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="text-xs text-muted-foreground">Portfolio impact:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div
                    key={j}
                    className={cn("w-3 h-1.5 rounded-sm", j < project.portfolioImpact ? "bg-brand-400" : "bg-white/8")}
                  />
                ))}
              </div>
              <span className="font-mono text-xs text-brand-400">{project.portfolioImpact}/10</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Salary ───────────────────────────────────────────────

function SalaryTab({ roadmap }: { roadmap: GeneratedRoadmap }) {
  return (
    <div className="space-y-6">
      {roadmap.salaryProjections.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-lg mb-4">Salary Growth Projection — India</h2>
          <SalaryChart projections={roadmap.salaryProjections} />
        </div>
      )}

      {roadmap.salaryInsights && (
        <div>
          <SectionDivider label="Salary Insights" />
          <p className="text-sm text-muted-foreground leading-relaxed">{roadmap.salaryInsights}</p>
        </div>
      )}

      {roadmap.cityOpportunities && (
        <div>
          <SectionDivider label="City-wise Opportunities" />
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {roadmap.cityOpportunities}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Tab: Jobs ─────────────────────────────────────────────────

function JobsTab({ roadmap }: { roadmap: GeneratedRoadmap }) {
  return (
    <div className="space-y-6">
      {roadmap.jobRoles.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-lg mb-3">Job Roles You Can Apply For</h2>
          <div className="flex flex-wrap gap-2">
            {roadmap.jobRoles.map((role) => (
              <span key={role} className="px-3 py-2 rounded-xl bg-brand-500/8 border border-brand-500/20 text-sm text-brand-300">
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {roadmap.internshipStrategy && (
        <div>
          <SectionDivider label="Internship Strategy — India" />
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {roadmap.internshipStrategy}
          </p>
        </div>
      )}

      {roadmap.interviewPrep && (
        <>
          <SectionDivider label="Interview Preparation" />
          <div className="grid sm:grid-cols-2 gap-4">
            {roadmap.interviewPrep.commonQuestions.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Common Questions</div>
                <ul className="space-y-1.5">
                  {roadmap.interviewPrep.commonQuestions.slice(0, 5).map((q) => (
                    <li key={q} className="text-sm text-muted-foreground flex items-start gap-1.5">
                      <span className="text-brand-400 flex-shrink-0">→</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {roadmap.interviewPrep.resources.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Prep Resources</div>
                <ul className="space-y-1.5">
                  {roadmap.interviewPrep.resources.slice(0, 5).map((r) => (
                    <li key={r} className="text-sm text-muted-foreground flex items-start gap-1.5">
                      <span className="text-success flex-shrink-0">✓</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      {roadmap.commonMistakes.length > 0 && (
        <>
          <SectionDivider label="Common Mistakes to Avoid" />
          <div className="space-y-2">
            {roadmap.commonMistakes.map((m, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-danger/5 border border-danger/15 text-sm">
                <span className="text-danger flex-shrink-0">✗</span>
                <span className="text-muted-foreground">{m}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Tab: Action Plans ─────────────────────────────────────────

function ActionTab({ roadmap }: { roadmap: GeneratedRoadmap }) {
  const [activePlan, setActivePlan] = useState<"7" | "30" | "90">("7");

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {(["7", "30", "90"] as const).map((plan) => (
          <button
            key={plan}
            onClick={() => setActivePlan(plan)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activePlan === plan
                ? "bg-brand-500/15 text-brand-300 border border-brand-500/35"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            )}
          >
            {plan}-Day Plan
          </button>
        ))}
      </div>

      {activePlan === "7" && roadmap.sevenDayPlan.length > 0 && (
        <div className="space-y-3">
          {roadmap.sevenDayPlan.map((day) => (
            <div key={day.day} className="p-4 rounded-xl border border-border/60 bg-white/2">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/12 border border-brand-500/25 flex items-center justify-center font-display font-bold text-sm text-brand-300">
                  {day.day}
                </div>
                <span className="font-display font-semibold text-sm">{day.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">{day.timeRequired}</span>
              </div>
              <ul className="space-y-1">
                {day.tasks.map((task) => (
                  <li key={task} className="text-sm text-muted-foreground flex items-start gap-1.5">
                    <span className="text-brand-400 flex-shrink-0 mt-0.5">→</span> {task}
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-xs text-success">🎯 Goal: {day.goal}</div>
            </div>
          ))}
        </div>
      )}

      {activePlan === "30" && roadmap.thirtyDayPlan.length > 0 && (
        <div className="space-y-3">
          {roadmap.thirtyDayPlan.map((week) => (
            <div key={week.week} className="p-4 rounded-xl border border-border/60 bg-white/2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center font-display font-bold text-sm text-gold">
                  W{week.week}
                </div>
                <span className="font-display font-semibold">{week.theme}</span>
              </div>
              <ul className="space-y-1.5 mb-3">
                {week.goals.map((goal) => (
                  <li key={goal} className="text-sm text-muted-foreground flex items-start gap-1.5">
                    <span className="text-gold flex-shrink-0">✦</span> {goal}
                  </li>
                ))}
              </ul>
              <div className="text-xs text-gold">🏆 Deliverable: {week.deliverable}</div>
            </div>
          ))}
        </div>
      )}

      {activePlan === "90" && roadmap.ninetyDayPlan.length > 0 && (
        <div className="space-y-3">
          {roadmap.ninetyDayPlan.map((month) => (
            <div key={month.month} className="p-5 rounded-xl border border-border/60 bg-white/2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-success/10 border border-success/25 flex items-center justify-center font-display font-bold text-sm text-success">
                  M{month.month}
                </div>
                <span className="font-display font-bold text-base">{month.theme}</span>
              </div>
              <ul className="space-y-2 mb-3">
                {month.milestones.map((m) => (
                  <li key={m} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-success flex-shrink-0">◉</span> {m}
                  </li>
                ))}
              </ul>
              <div className="text-sm text-success border-t border-border/40 pt-3 mt-3">
                ✅ Success metric: {month.successMetric}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────

function buildDownloadText(r: GeneratedRoadmap): string {
  return `# ${r.careerLabel} Career Roadmap — CareerPath AI India

Generated: ${r.generatedAt}

## Profile
- Education: ${r.answers.education}
- Level: ${r.answers.level}
- Goal: ${r.answers.goalType}
- Time available: ${r.answers.timePerDay}
- Target salary: ${r.answers.targetSalary}
- Target city: ${r.answers.city}

## Career Overview
${r.careerOverview}

## Time to Job Estimate
${r.timeToJobEstimate}

## Beginner Skills
${r.beginnerSkills.map((s) => `- ${s}`).join("\n")}

## Intermediate Skills
${r.intermediateSkills.map((s) => `- ${s}`).join("\n")}

## Advanced Skills
${r.advancedSkills.map((s) => `- ${s}`).join("\n")}

## Roadmap Phases
${r.phases.map((p) => `### ${p.title} (${p.duration})\n${p.skills.join(", ")}`).join("\n\n")}

## Projects
${r.projects.map((p, i) => `${i + 1}. **${p.title}** (${p.difficulty})\n   ${p.description}`).join("\n\n")}

## Salary Insights
${r.salaryInsights}

## 7-Day Plan
${r.sevenDayPlan.map((d) => `**Day ${d.day}: ${d.title}**\n${d.tasks.map((t) => `- ${t}`).join("\n")}`).join("\n\n")}

---
Generated by CareerPath AI India — https://careerpathai.in
`;
}
