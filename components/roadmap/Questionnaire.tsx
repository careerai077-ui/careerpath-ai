// ============================================================
// components/roadmap/Questionnaire.tsx
// ============================================================

"use client";

import React, { useState } from "react";
import type { UserAnswers, SkillLevel, GoalType } from "@/types";
import { Button, ProgressBar, GlassCard } from "@/components/ui";
import { cn } from "@/utils";

interface QuestionnaireProps {
  careerLabel: string;
  careerIcon: string;
  onSubmit: (answers: UserAnswers) => void;
  onBack: () => void;
}

interface Question {
  key: keyof UserAnswers;
  label: string;
  subtitle?: string;
  type: "select" | "text";
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

const QUESTIONS: Question[] = [
  {
    key: "education",
    label: "What's your current education level?",
    subtitle: "This helps us tailor the starting point of your roadmap",
    type: "select",
    required: true,
    options: [
      "Class 10 / SSC",
      "Class 12 / HSC",
      "Pursuing B.Tech / B.Sc / BCA",
      "Pursuing BBA / BCom / BA",
      "Graduate — B.Tech / B.Sc / BCA",
      "Graduate — BBA / BCom / BA / any field",
      "Postgraduate / M.Tech / MBA / M.Sc",
      "Working Professional (switching career)",
    ],
  },
  {
    key: "level",
    label: "Rate your current skill level honestly",
    subtitle: "We'll calibrate the depth of your roadmap accordingly",
    type: "select",
    required: true,
    options: [
      "Complete Beginner — never tried this field",
      "Know the basics — watched tutorials, done small things",
      "Intermediate — built a few projects independently",
      "Advanced — working professionally or have strong projects",
    ],
  },
  {
    key: "timePerDay",
    label: "How many hours can you dedicate daily?",
    subtitle: "We'll use this to give you a realistic timeline",
    type: "select",
    required: true,
    options: [
      "Less than 1 hour / day",
      "1–2 hours / day",
      "2–4 hours / day",
      "4–6 hours / day",
      "6+ hours / day (full-time focus)",
    ],
  },
  {
    key: "budget",
    label: "What's your monthly learning budget?",
    subtitle: "We'll prioritize free or paid resources accordingly",
    type: "select",
    required: true,
    options: [
      "₹0 — Free resources only (YouTube, freeCodeCamp, etc.)",
      "₹500–₹1,500 / month",
      "₹1,500–₹5,000 / month",
      "₹5,000–₹15,000 / month",
      "₹15,000+ / month (bootcamps, premium courses)",
    ],
  },
  {
    key: "targetSalary",
    label: "What's your target annual salary?",
    subtitle: "This helps us set a realistic and motivating milestone",
    type: "select",
    required: true,
    options: [
      "₹3–5 LPA — Entry level, get placed first",
      "₹5–10 LPA — Stable job in good company",
      "₹10–20 LPA — Strong developer / specialist",
      "₹20–40 LPA — Senior / lead role",
      "₹40 LPA+ — Staff / architect / director level",
    ],
  },
  {
    key: "goalType",
    label: "What's your primary goal?",
    subtitle: "Your roadmap will be specifically tailored for this path",
    type: "select",
    required: true,
    options: [
      "job — Get a salaried job / placement",
      "freelance — Build freelancing income",
      "startup — Build my own startup / product",
      "international — Get a remote / international job",
      "higher_studies — Prepare for MS / MBA / higher studies",
      "government — Government / PSU job",
    ],
  },
  {
    key: "city",
    label: "Which city are you targeting?",
    subtitle: "We'll include city-specific salary and opportunity data",
    type: "select",
    required: true,
    options: [
      "Bangalore",
      "Mumbai",
      "Delhi / NCR (Gurgaon, Noida)",
      "Hyderabad",
      "Pune",
      "Chennai",
      "Kolkata",
      "Tier 2 City (Indore, Jaipur, Nagpur, etc.)",
      "Any Indian city",
      "Remote / Work from anywhere",
      "International / Abroad",
    ],
  },
  {
    key: "motivation",
    label: "Anything specific you want your roadmap to address?",
    subtitle: "Optional — share a challenge, career switch story, or special goal",
    type: "text",
    required: false,
    placeholder:
      "e.g. I failed interviews twice, I want to switch from IT support to development, I need to earn ₹1L/month in 1 year...",
  },
];

// Map display option to clean value
function extractValue(key: keyof UserAnswers, display: string): string {
  if (key === "goalType") {
    const match = display.match(/^(\w+) —/);
    return match ? match[1] : display;
  }
  return display;
}

function extractLevel(display: string): SkillLevel {
  if (display.toLowerCase().includes("beginner")) return "beginner";
  if (display.toLowerCase().includes("intermediate")) return "intermediate";
  if (display.toLowerCase().includes("advanced")) return "advanced";
  return "beginner";
}

export function Questionnaire({ careerLabel, careerIcon, onSubmit, onBack }: QuestionnaireProps) {
  const [step, setStep] = useState(0);
  const [rawAnswers, setRawAnswers] = useState<Record<string, string>>({});

  const question = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;
  const currentValue = rawAnswers[question.key] ?? "";
  const canProceed = !question.required || currentValue.trim().length > 0;

  const handleSelect = (value: string) => {
    setRawAnswers((prev) => ({ ...prev, [question.key]: value }));
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      // Build typed answers
      const answers: UserAnswers = {
        education: rawAnswers.education ?? "",
        level: extractLevel(rawAnswers.level ?? ""),
        timePerDay: rawAnswers.timePerDay ?? "",
        budget: rawAnswers.budget ?? "",
        targetSalary: rawAnswers.targetSalary ?? "",
        goalType: (extractValue("goalType", rawAnswers.goalType ?? "job")) as GoalType,
        city: rawAnswers.city ?? "",
        strengths: "",
        weakAreas: "",
        motivation: rawAnswers.motivation ?? "",
      };
      onSubmit(answers);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else onBack();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      {/* Career badge */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-2xl">
          {careerIcon}
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-0.5">Generating roadmap for</div>
          <div className="font-display font-bold text-base">{careerLabel}</div>
        </div>
        <div className="ml-auto">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors">
            ← Back
          </button>
        </div>
      </div>

      <GlassCard className="p-7 sm:p-9">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs text-muted-foreground">
              Step {step + 1} of {QUESTIONS.length}
            </span>
            <span className="font-mono text-xs text-brand-400">{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} size="md" animated />
        </div>

        {/* Question */}
        <div key={step} className="animate-fade-up">
          <h2 className="font-display font-bold text-xl leading-snug mb-1.5">
            {question.label}
          </h2>
          {question.subtitle && (
            <p className="text-sm text-muted-foreground mb-6">{question.subtitle}</p>
          )}

          {question.type === "select" && question.options ? (
            <div className="flex flex-col gap-2.5">
              {question.options.map((opt) => {
                const selected = currentValue === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200",
                      selected
                        ? "bg-brand-500/12 border-brand-500/50 text-brand-200"
                        : "bg-white/2 border-border hover:border-brand-500/30 hover:bg-brand-500/5 text-muted-foreground"
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <textarea
              className={cn(
                "w-full min-h-[110px] px-4 py-3 rounded-xl border text-sm bg-input border-border",
                "text-foreground placeholder:text-muted-foreground resize-y",
                "focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
              )}
              placeholder={question.placeholder}
              value={currentValue}
              onChange={(e) => handleSelect(e.target.value)}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            ← {step === 0 ? "Cancel" : "Back"}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            disabled={!canProceed}
            className={cn(!canProceed && "opacity-40 cursor-not-allowed")}
          >
            {step === QUESTIONS.length - 1 ? "Generate My Roadmap ✦" : "Next →"}
          </Button>
        </div>
      </GlassCard>

      {/* Step dots */}
      <div className="flex justify-center gap-1.5 mt-5">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-full transition-all duration-300",
              i < step
                ? "w-4 h-1.5 bg-success"
                : i === step
                ? "w-6 h-1.5 bg-brand-400"
                : "w-1.5 h-1.5 bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}
