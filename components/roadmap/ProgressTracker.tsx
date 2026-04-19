// ============================================================
// components/roadmap/ProgressTracker.tsx
// ============================================================

"use client";

import React, { useState } from "react";
import type { GeneratedRoadmap, Milestone } from "@/types";
import { Button, StatCard, ProgressBar } from "@/components/ui";
import { nanoid } from "nanoid";
import { cn, getXPLevel, getProgressLabel } from "@/utils";

interface ProgressTrackerProps {
  roadmap: GeneratedRoadmap;
  onUpdate: (updated: GeneratedRoadmap) => void;
}

export function ProgressTracker({ roadmap, onUpdate }: ProgressTrackerProps) {
  const [newLabel, setNewLabel] = useState("");
  const milestones: Milestone[] = roadmap.milestones ?? [];

  const completedCount = milestones.filter((m) => m.completed).length;
  const progress = milestones.length > 0
    ? Math.round((completedCount / milestones.length) * 100)
    : roadmap.progress;

  const totalXP = milestones.filter((m) => m.completed).reduce((sum, m) => sum + (m.xpReward ?? 50), 0);
  const { level, title } = getXPLevel(totalXP);

  const toggleMilestone = (id: string) => {
    const updated = milestones.map((m) =>
      m.id === id
        ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined }
        : m
    );
    const newProgress = Math.round((updated.filter((m) => m.completed).length / updated.length) * 100);
    onUpdate({ ...roadmap, milestones: updated, progress: newProgress });
  };

  const addMilestone = () => {
    if (!newLabel.trim()) return;
    const newMilestone: Milestone = {
      id: nanoid(8),
      label: newLabel.trim(),
      xpReward: 50,
      completed: false,
    };
    onUpdate({ ...roadmap, milestones: [...milestones, newMilestone] });
    setNewLabel("");
  };

  const deleteMilestone = (id: string) => {
    const updated = milestones.filter((m) => m.id !== id);
    onUpdate({ ...roadmap, milestones: updated });
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="🎯" label="Progress" value={`${progress}%`} sub={getProgressLabel(progress)} variant="brand" />
        <StatCard icon="✅" label="Completed" value={`${completedCount}/${milestones.length}`} variant="green" />
        <StatCard icon="⭐" label="XP Earned" value={`${totalXP}`} variant="gold" />
        <StatCard icon="🏅" label="Level" value={`L${level}`} sub={title} variant="brand" />
      </div>

      {/* Overall progress */}
      <div>
        <ProgressBar value={progress} size="lg" showValue label="Overall Roadmap Progress" />
      </div>

      {/* Milestones */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-base">Milestones</h3>
          <span className="text-xs text-muted-foreground">{completedCount} of {milestones.length} done</span>
        </div>

        {milestones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No milestones yet. Add your first one below.
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {milestones.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-xl border transition-all group",
                  m.completed
                    ? "bg-success/5 border-success/20"
                    : "bg-white/2 border-border/60 hover:border-brand-500/25"
                )}
              >
                <button
                  onClick={() => toggleMilestone(m.id)}
                  className={cn(
                    "w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all",
                    m.completed
                      ? "bg-success border-success"
                      : "border-border hover:border-brand-400"
                  )}
                >
                  {m.completed && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                <span className={cn(
                  "flex-1 text-sm",
                  m.completed ? "line-through text-muted-foreground" : "text-foreground"
                )}>
                  {m.label}
                </span>

                <span className="font-mono text-xs text-muted-foreground">+{m.xpReward ?? 50} XP</span>

                <button
                  onClick={() => deleteMilestone(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-danger transition-all text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add milestone */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 transition-all"
            placeholder="Add a milestone..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMilestone()}
          />
          <Button variant="secondary" size="sm" onClick={addMilestone}>
            + Add
          </Button>
        </div>
      </div>
    </div>
  );
}
